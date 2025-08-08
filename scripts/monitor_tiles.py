#!/usr/bin/env python3
"""
Automated Tile System Monitor

This script provides continuous monitoring of the tile system health,
tracking validation metrics over time and alerting on issues.

Usage:
    python scripts/monitor_tiles.py                    # Run once
    python scripts/monitor_tiles.py --continuous       # Run continuously
    python scripts/monitor_tiles.py --threshold 0.75   # Set success threshold
"""

import argparse
import json
import time
import sys
import os
from datetime import datetime, timedelta
from pathlib import Path
import subprocess
import logging

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from scripts.validate_tiles_advanced import run_validation

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('tile_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TileMonitor:
    def __init__(self, threshold=0.75, history_file='tile_monitor_history.json'):
        self.threshold = threshold
        self.history_file = Path(history_file)
        self.history = self.load_history()
        
    def load_history(self):
        """Load monitoring history from file"""
        if self.history_file.exists():
            try:
                with open(self.history_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Could not load history: {e}")
        return {'runs': [], 'alerts': []}
    
    def save_history(self):
        """Save monitoring history to file"""
        try:
            with open(self.history_file, 'w') as f:
                json.dump(self.history, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Could not save history: {e}")
    
    def run_validation(self):
        """Run tile validation and return results"""
        try:
            results = run_validation()
            return results
        except Exception as e:
            logger.error(f"Validation failed: {e}")
            return None
    
    def analyze_results(self, results):
        """Analyze validation results and generate insights"""
        if not results:
            return None
            
        summary = results.get('summary', {})
        success_rate = summary.get('success_rate', 0)
        
        # Extract key metrics
        analysis = {
            'timestamp': datetime.now().isoformat(),
            'success_rate': success_rate,
            'total_checks': summary.get('total_checks', 0),
            'passed': summary.get('passed', 0),
            'failed': summary.get('failed', 0),
            'warnings': summary.get('warnings', 0),
            'status': 'pass' if success_rate >= self.threshold else 'fail',
            'issues': []
        }
        
        # Identify specific issues
        for result in results.get('results', []):
            if result.get('status') == 'fail':
                analysis['issues'].append({
                    'layer': result.get('layer_name'),
                    'message': result.get('message')
                })
        
        return analysis
    
    def check_alerts(self, analysis):
        """Check if alerts should be triggered"""
        alerts = []
        
        if analysis['status'] == 'fail':
            alerts.append({
                'type': 'threshold_breach',
                'message': f"Success rate {analysis['success_rate']:.1%} below threshold {self.threshold:.1%}",
                'severity': 'high',
                'timestamp': analysis['timestamp']
            })
        
        # Check for critical layer failures
        critical_layers = ['admin_boundaries']
        for issue in analysis['issues']:
            if issue['layer'] in critical_layers:
                alerts.append({
                    'type': 'critical_layer_failure',
                    'message': f"Critical layer {issue['layer']} failed: {issue['message']}",
                    'severity': 'critical',
                    'timestamp': analysis['timestamp']
                })
        
        return alerts
    
    def generate_report(self, analysis, alerts):
        """Generate monitoring report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'status': analysis['status'],
                'success_rate': f"{analysis['success_rate']:.1%}",
                'checks_passed': f"{analysis['passed']}/{analysis['total_checks']}",
                'alerts_count': len(alerts)
            },
            'details': analysis,
            'alerts': alerts,
            'recommendations': self.generate_recommendations(analysis, alerts)
        }
        
        return report
    
    def generate_recommendations(self, analysis, alerts):
        """Generate recommendations based on current state"""
        recommendations = []
        
        if analysis['status'] == 'fail':
            recommendations.append({
                'priority': 'high',
                'action': 'Investigate failing checks',
                'details': f"Success rate {analysis['success_rate']:.1%} below threshold {self.threshold:.1%}"
            })
        
        # Check for specific issues
        for issue in analysis['issues']:
            if 'tile serving' in issue['message'].lower():
                recommendations.append({
                    'priority': 'medium',
                    'action': 'Check tile server configuration',
                    'details': f"Layer {issue['layer']} returning 204 No Content"
                })
            elif 'geojson' in issue['message'].lower():
                recommendations.append({
                    'priority': 'high',
                    'action': 'Regenerate GeoJSON data',
                    'details': f"Layer {issue['layer']} has structural issues"
                })
        
        return recommendations
    
    def run_once(self):
        """Run single monitoring cycle"""
        logger.info("Starting tile system monitoring...")
        
        # Run validation
        results = self.run_validation()
        if not results:
            logger.error("Validation failed, cannot continue")
            return False
        
        # Analyze results
        analysis = self.analyze_results(results)
        if not analysis:
            logger.error("Analysis failed")
            return False
        
        # Check for alerts
        alerts = self.check_alerts(analysis)
        
        # Generate report
        report = self.generate_report(analysis, alerts)
        
        # Log results
        logger.info(f"Monitoring complete - Success rate: {analysis['success_rate']:.1%}")
        if alerts:
            logger.warning(f"Generated {len(alerts)} alerts")
            for alert in alerts:
                logger.warning(f"Alert: {alert['message']}")
        
        # Save to history
        self.history['runs'].append(report)
        if alerts:
            self.history['alerts'].extend(alerts)
        
        # Keep only last 100 runs
        if len(self.history['runs']) > 100:
            self.history['runs'] = self.history['runs'][-100:]
        
        self.save_history()
        
        # Print summary
        self.print_summary(report)
        
        return analysis['status'] == 'pass'
    
    def print_summary(self, report):
        """Print monitoring summary"""
        print("\n" + "="*60)
        print("🎯 TILE SYSTEM MONITORING REPORT")
        print("="*60)
        print(f"📊 Status: {report['summary']['status'].upper()}")
        print(f"📈 Success Rate: {report['summary']['success_rate']}")
        print(f"✅ Checks Passed: {report['summary']['checks_passed']}")
        print(f"🚨 Alerts: {report['summary']['alerts_count']}")
        
        if report['alerts']:
            print("\n🚨 ACTIVE ALERTS:")
            for alert in report['alerts']:
                print(f"  • {alert['severity'].upper()}: {alert['message']}")
        
        if report['recommendations']:
            print("\n💡 RECOMMENDATIONS:")
            for rec in report['recommendations']:
                print(f"  • {rec['priority'].upper()}: {rec['action']}")
                print(f"    {rec['details']}")
        
        print("="*60)
    
    def run_continuous(self, interval=3600):
        """Run continuous monitoring"""
        logger.info(f"Starting continuous monitoring (interval: {interval}s)")
        
        while True:
            try:
                success = self.run_once()
                
                if not success:
                    logger.warning("Monitoring cycle failed - tile system may have issues")
                
                logger.info(f"Next check in {interval} seconds...")
                time.sleep(interval)
                
            except KeyboardInterrupt:
                logger.info("Monitoring stopped by user")
                break
            except Exception as e:
                logger.error(f"Monitoring error: {e}")
                time.sleep(60)  # Wait before retrying

def main():
    parser = argparse.ArgumentParser(description='Tile System Monitor')
    parser.add_argument('--continuous', action='store_true', 
                       help='Run continuous monitoring')
    parser.add_argument('--threshold', type=float, default=0.75,
                       help='Success rate threshold (default: 0.75)')
    parser.add_argument('--interval', type=int, default=3600,
                       help='Monitoring interval in seconds (default: 3600)')
    parser.add_argument('--history-file', default='tile_monitor_history.json',
                       help='History file path (default: tile_monitor_history.json)')
    
    args = parser.parse_args()
    
    # Create monitor
    monitor = TileMonitor(
        threshold=args.threshold,
        history_file=args.history_file
    )
    
    if args.continuous:
        monitor.run_continuous(args.interval)
    else:
        success = monitor.run_once()
        sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
