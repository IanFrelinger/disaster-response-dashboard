"""
Error Correlation API
Handles error logging and correlation between frontend and backend
"""

from flask import Flask, request, jsonify
from typing import Dict, List, Any, Optional
import time
import json
import logging
from datetime import datetime, timedelta
import threading
from collections import defaultdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ErrorCorrelationService:
    """Backend error correlation service"""
    
    def __init__(self):
        self.errors: List[Dict[str, Any]] = []
        self.correlations: List[Dict[str, Any]] = []
        self.lock = threading.Lock()
        self.cleanup_interval = 300  # 5 minutes
        self.max_errors = 1000
        
        # Start cleanup thread
        self.start_cleanup_thread()
    
    def start_cleanup_thread(self):
        """Start background thread to clean up old errors"""
        def cleanup():
            while True:
                time.sleep(self.cleanup_interval)
                self.cleanup_old_errors()
        
        thread = threading.Thread(target=cleanup, daemon=True)
        thread.start()
    
    def cleanup_old_errors(self):
        """Remove errors older than 1 hour"""
        with self.lock:
            cutoff_time = time.time() - 3600  # 1 hour ago
            self.errors = [e for e in self.errors if e.get('timestamp', 0) > cutoff_time]
            self.correlations = [c for c in self.correlations if c.get('timestamp', 0) > cutoff_time]
    
    def log_error(self, error_data: Dict[str, Any]) -> str:
        """Log a new error"""
        error_id = f"backend-{int(time.time() * 1000)}-{len(self.errors)}"
        
        error = {
            'id': error_id,
            'timestamp': time.time(),
            'level': error_data.get('level', 'error'),
            'source': error_data.get('source', 'backend'),
            'category': self.categorize_error(error_data),
            'message': error_data.get('message', 'Unknown error'),
            'stack': error_data.get('stack'),
            'context': error_data.get('context', {}),
            'correlation_id': error_data.get('correlationId'),
            'related_errors': []
        }
        
        with self.lock:
            self.errors.append(error)
            
            # Keep only recent errors
            if len(self.errors) > self.max_errors:
                self.errors = self.errors[-self.max_errors:]
        
        # Auto-correlate with existing errors
        self.auto_correlate(error)
        
        logger.info(f"Logged error: {error_id} - {error['message']}")
        return error_id
    
    def categorize_error(self, error_data: Dict[str, Any]) -> str:
        """Categorize error based on content"""
        message = error_data.get('message', '').lower()
        
        if 'ontology' in message or 'palantir' in message:
            return 'ontology'
        elif 'type' in message or 'mypy' in message:
            return 'type'
        elif 'validation' in message or 'schema' in message:
            return 'validation'
        elif 'network' in message or 'connection' in message:
            return 'network'
        elif 'performance' in message or 'timeout' in message:
            return 'performance'
        else:
            return 'runtime'
    
    def auto_correlate(self, new_error: Dict[str, Any]):
        """Auto-correlate new error with existing errors"""
        with self.lock:
            recent_errors = [e for e in self.errors 
                           if e['id'] != new_error['id'] 
                           and abs(e['timestamp'] - new_error['timestamp']) < 10]
            
            for existing_error in recent_errors:
                if self.find_correlation(new_error, existing_error):
                    # Link errors
                    new_error['related_errors'].append(existing_error['id'])
                    existing_error['related_errors'].append(new_error['id'])
    
    def find_correlation(self, error1: Dict[str, Any], error2: Dict[str, Any]) -> bool:
        """Find correlation between two errors"""
        # Same category
        if error1['category'] == error2['category']:
            return True
        
        # Similar message
        if self.similarity(error1['message'], error2['message']) > 0.7:
            return True
        
        # Same context keys
        context1 = error1.get('context', {})
        context2 = error2.get('context', {})
        if context1 and context2:
            common_keys = set(context1.keys()) & set(context2.keys())
            if len(common_keys) > 0:
                return True
        
        return False
    
    def similarity(self, s1: str, s2: str) -> float:
        """Calculate string similarity"""
        if not s1 or not s2:
            return 0.0
        
        longer = s1 if len(s1) > len(s2) else s2
        shorter = s2 if len(s1) > len(s2) else s1
        
        if len(longer) == 0:
            return 1.0
        
        distance = self.levenshtein_distance(longer, shorter)
        return (len(longer) - distance) / len(longer)
    
    def levenshtein_distance(self, s1: str, s2: str) -> int:
        """Calculate Levenshtein distance"""
        if len(s1) < len(s2):
            return self.levenshtein_distance(s2, s1)
        
        if len(s2) == 0:
            return len(s1)
        
        previous_row = list(range(len(s2) + 1))
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        return previous_row[-1]
    
    def get_errors(self, source: Optional[str] = None, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get errors with optional filtering"""
        with self.lock:
            errors = self.errors.copy()
        
        if source:
            errors = [e for e in errors if e['source'] == source]
        
        if category:
            errors = [e for e in errors if e['category'] == category]
        
        return errors
    
    def get_correlations(self) -> Dict[str, Any]:
        """Get error correlations and summary"""
        with self.lock:
            errors = self.errors.copy()
        
        # Group errors by source
        frontend_errors = [e for e in errors if e['source'] == 'frontend']
        backend_errors = [e for e in errors if e['source'] == 'backend']
        ui_errors = [e for e in errors if e['source'] == 'ui']
        network_errors = [e for e in errors if e['source'] == 'network']
        
        # Find correlations
        correlations = self.find_all_correlations(errors)
        
        # Generate summary
        summary = self.generate_summary(errors, correlations)
        
        return {
            'frontend_errors': frontend_errors,
            'backend_errors': backend_errors,
            'ui_errors': ui_errors,
            'network_errors': network_errors,
            'correlations': correlations,
            'summary': summary
        }
    
    def find_all_correlations(self, errors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Find all correlations between errors"""
        correlations = []
        processed = set()
        
        for error1 in errors:
            if error1['id'] in processed:
                continue
            
            related_errors = [e for e in errors 
                            if e['id'] != error1['id'] 
                            and e['id'] not in processed
                            and self.find_correlation(error1, e)]
            
            if related_errors:
                correlation = {
                    'type': self.determine_correlation_type(error1, related_errors[0]),
                    'confidence': self.calculate_confidence(error1, related_errors),
                    'description': self.generate_correlation_description(error1, related_errors),
                    'errors': [error1['id']] + [e['id'] for e in related_errors],
                    'timestamp': time.time()
                }
                correlations.append(correlation)
                
                # Mark as processed
                processed.add(error1['id'])
                for e in related_errors:
                    processed.add(e['id'])
        
        return correlations
    
    def determine_correlation_type(self, error1: Dict[str, Any], error2: Dict[str, Any]) -> str:
        """Determine correlation type"""
        if error1['source'] != error2['source']:
            return 'causal'
        elif abs(error1['timestamp'] - error2['timestamp']) < 1:
            return 'temporal'
        elif error1['category'] == error2['category']:
            return 'contextual'
        else:
            return 'pattern'
    
    def calculate_confidence(self, error1: Dict[str, Any], related_errors: List[Dict[str, Any]]) -> float:
        """Calculate correlation confidence"""
        total_confidence = 0
        
        for error2 in related_errors:
            confidence = 0
            
            # Category match
            if error1['category'] == error2['category']:
                confidence += 0.3
            
            # Message similarity
            confidence += self.similarity(error1['message'], error2['message']) * 0.4
            
            # Temporal proximity
            time_diff = abs(error1['timestamp'] - error2['timestamp'])
            if time_diff < 1:
                confidence += 0.3
            elif time_diff < 5:
                confidence += 0.2
            elif time_diff < 10:
                confidence += 0.1
            
            total_confidence += min(confidence, 1.0)
        
        return total_confidence / len(related_errors) if related_errors else 0
    
    def generate_correlation_description(self, error1: Dict[str, Any], related_errors: List[Dict[str, Any]]) -> str:
        """Generate correlation description"""
        categories = [error1['category']] + [e['category'] for e in related_errors]
        unique_categories = list(set(categories))
        
        if len(unique_categories) == 1:
            return f"Multiple {unique_categories[0]} errors detected"
        
        sources = [error1['source']] + [e['source'] for e in related_errors]
        unique_sources = list(set(sources))
        
        if len(unique_sources) > 1:
            return f"Cross-stack error correlation: {' + '.join(unique_sources)}"
        
        return f"Pattern detected: {len(related_errors) + 1} related errors"
    
    def generate_summary(self, errors: List[Dict[str, Any]], correlations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate error summary"""
        total_errors = len(errors)
        critical_errors = len([e for e in errors if e['level'] == 'error'])
        resolved_errors = len([e for e in errors if e.get('context', {}).get('resolved', False)])
        
        patterns = [c['description'] for c in correlations]
        unique_patterns = list(set(patterns))
        
        recommendations = self.generate_recommendations(errors, correlations)
        
        return {
            'total_errors': total_errors,
            'critical_errors': critical_errors,
            'resolved_errors': resolved_errors,
            'patterns': unique_patterns,
            'recommendations': recommendations
        }
    
    def generate_recommendations(self, errors: List[Dict[str, Any]], correlations: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations based on errors"""
        recommendations = []
        
        ontology_errors = [e for e in errors if e['category'] == 'ontology']
        if ontology_errors:
            recommendations.append('Consider implementing Palantir Foundry platform integration or mock services')
        
        type_errors = [e for e in errors if e['category'] == 'type']
        if type_errors:
            recommendations.append('Review TypeScript type definitions and add missing type annotations')
        
        network_errors = [e for e in errors if e['category'] == 'network']
        if network_errors:
            recommendations.append('Check network connectivity and API endpoint availability')
        
        performance_errors = [e for e in errors if e['category'] == 'performance']
        if performance_errors:
            recommendations.append('Optimize performance-critical code paths and consider caching')
        
        if correlations:
            recommendations.append('Investigate correlated errors - they may share a common root cause')
        
        return recommendations

# Global error correlation service
error_service = ErrorCorrelationService()

def create_error_correlation_routes(app: Flask):
    """Create error correlation API routes"""
    
    @app.route('/api/errors', methods=['POST'])
    def log_error():
        """Log a new error"""
        try:
            error_data = request.get_json()
            if not error_data:
                return jsonify({'error': 'No error data provided'}), 400
            
            error_id = error_service.log_error(error_data)
            return jsonify({'id': error_id, 'status': 'logged'}), 201
        
        except Exception as e:
            logger.error(f"Error logging error: {e}")
            return jsonify({'error': 'Failed to log error'}), 500
    
    @app.route('/api/errors', methods=['GET'])
    def get_errors():
        """Get errors with optional filtering"""
        try:
            source = request.args.get('source')
            category = request.args.get('category')
            
            errors = error_service.get_errors(source=source, category=category)
            return jsonify(errors), 200
        
        except Exception as e:
            logger.error(f"Error getting errors: {e}")
            return jsonify({'error': 'Failed to get errors'}), 500
    
    @app.route('/api/errors/correlations', methods=['GET'])
    def get_correlations():
        """Get error correlations and summary"""
        try:
            correlations = error_service.get_correlations()
            return jsonify(correlations), 200
        
        except Exception as e:
            logger.error(f"Error getting correlations: {e}")
            return jsonify({'error': 'Failed to get correlations'}), 500
    
    @app.route('/api/errors/summary', methods=['GET'])
    def get_error_summary():
        """Get error summary"""
        try:
            correlations = error_service.get_correlations()
            return jsonify(correlations['summary']), 200
        
        except Exception as e:
            logger.error(f"Error getting summary: {e}")
            return jsonify({'error': 'Failed to get summary'}), 500
    
    @app.route('/api/errors/clear', methods=['POST'])
    def clear_errors():
        """Clear all errors"""
        try:
            error_service.errors.clear()
            error_service.correlations.clear()
            return jsonify({'status': 'cleared'}), 200
        
        except Exception as e:
            logger.error(f"Error clearing errors: {e}")
            return jsonify({'error': 'Failed to clear errors'}), 500
