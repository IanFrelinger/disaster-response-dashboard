"""
Tests for Foundry sync script.
"""

import pytest
import os
from unittest.mock import Mock, patch, mock_open
from click.testing import CliRunner

from scripts.sync_to_foundry import sync_transforms, list_repositories, cli


class TestFoundrySyncScript:
    """Test suite for Foundry sync script."""
    
    def test_sync_transforms_basic(self, mock_foundry_client):
        """Test basic sync functionality."""
        runner = CliRunner()
        
        with patch('scripts.sync_to_foundry.FoundryClient') as mock_client_class:
            mock_client_class.return_value = mock_foundry_client
            
            # Mock path existence
            with patch('os.path.exists', return_value=True):
                result = runner.invoke(cli, ['sync-transforms', '--env', 'dev'])
                
                assert result.exit_code == 0
                assert "Foundry sync completed successfully" in result.output
    
    def test_sync_transforms_with_repository_rid(self, mock_foundry_client):
        """Test sync with specific repository RID."""
        runner = CliRunner()
        
        with patch('scripts.sync_to_foundry.FoundryClient') as mock_client_class:
            mock_client_class.return_value = mock_foundry_client
            
            with patch('os.path.exists', return_value=True):
                result = runner.invoke(cli, [
                    'sync-transforms',
                    '--env', 'dev',
                    '--repository-rid', 'ri.test.repo.123'
                ])
                
                assert result.exit_code == 0
                mock_foundry_client.upload_repository.assert_called_once()
                mock_foundry_client.build_repository.assert_called_once_with(
                    repository_rid='ri.test.repo.123'
                )
    
    def test_sync_transforms_dry_run(self, mock_foundry_client):
        """Test sync with dry run flag."""
        runner = CliRunner()
        
        with patch('scripts.sync_to_foundry.FoundryClient') as mock_client_class:
            mock_client_class.return_value = mock_foundry_client
            
            with patch('os.path.exists', return_value=True):
                result = runner.invoke(cli, [
                    'sync-transforms',
                    '--env', 'dev',
                    '--dry-run'
                ])
                
                assert result.exit_code == 0
                assert "DRY RUN" in result.output
                # Should not call upload or build methods
                mock_foundry_client.upload_repository.assert_not_called()
                mock_foundry_client.build_repository.assert_not_called()
    
    def test_sync_transforms_missing_paths(self, mock_foundry_client):
        """Test sync with missing paths."""
        runner = CliRunner()
        
        with patch('scripts.sync_to_foundry.FoundryClient') as mock_client_class:
            mock_client_class.return_value = mock_foundry_client
            
            # Mock path does not exist
            with patch('os.path.exists', return_value=False):
                result = runner.invoke(cli, [
                    'sync-transforms',
                    '--env', 'dev',
                    '--transforms-path', 'nonexistent/path'
                ])
                
                assert result.exit_code != 0
                assert "does not exist" in result.output
    
    def test_sync_transforms_custom_paths(self, mock_foundry_client):
        """Test sync with custom paths."""
        runner = CliRunner()
        
        with patch('scripts.sync_to_foundry.FoundryClient') as mock_client_class:
            mock_client_class.return_value = mock_foundry_client
            
            with patch('os.path.exists', return_value=True):
                result = runner.invoke(cli, [
                    'sync-transforms',
                    '--env', 'dev',
                    '--transforms-path', 'custom/transforms',
                    '--functions-path', 'custom/functions',
                    '--repository-rid', 'ri.test.repo.123'
                ])
                
                assert result.exit_code == 0
                # Verify custom paths were used
                mock_foundry_client.upload_repository.assert_called_with(
                    path='custom/transforms',
                    repository_rid='ri.test.repo.123'
                )
    
    def test_sync_transforms_no_repository_rid(self, mock_foundry_client):
        """Test sync without repository RID."""
        runner = CliRunner()
        
        with patch('scripts.sync_to_foundry.FoundryClient') as mock_client_class:
            mock_client_class.return_value = mock_foundry_client
            
            with patch('os.path.exists', return_value=True):
                result = runner.invoke(cli, ['sync-transforms', '--env', 'dev'])
                
                assert result.exit_code == 0
                assert "No repository RID provided" in result.output
                mock_foundry_client.upload_repository.assert_not_called()
    
    def test_sync_transforms_error_handling(self, mock_foundry_client):
        """Test sync error handling."""
        runner = CliRunner()
        
        # Mock client to raise exception
        mock_foundry_client.upload_repository.side_effect = Exception("Upload failed")
        
        with patch('scripts.sync_to_foundry.FoundryClient') as mock_client_class:
            mock_client_class.return_value = mock_foundry_client
            
            with patch('os.path.exists', return_value=True):
                result = runner.invoke(cli, [
                    'sync-transforms',
                    '--env', 'dev',
                    '--repository-rid', 'ri.test.repo.123'
                ])
                
                assert result.exit_code != 0
                assert "Sync failed" in result.output
    
    def test_list_repositories(self, mock_foundry_client):
        """Test list repositories functionality."""
        runner = CliRunner()
        
        with patch('scripts.sync_to_foundry.FoundryClient') as mock_client_class:
            mock_client_class.return_value = mock_foundry_client
            
            result = runner.invoke(cli, ['list-repositories', '--env', 'dev'])
            
            assert result.exit_code == 0
            assert "Available repositories" in result.output
            assert "test-repo" in result.output
            assert "ri.test.repo.123" in result.output
            mock_foundry_client.list_repositories.assert_called_once()
    
    def test_list_repositories_error_handling(self, mock_foundry_client):
        """Test list repositories error handling."""
        runner = CliRunner()
        
        # Mock client to raise exception
        mock_foundry_client.list_repositories.side_effect = Exception("List failed")
        
        with patch('scripts.sync_to_foundry.FoundryClient') as mock_client_class:
            mock_client_class.return_value = mock_foundry_client
            
            result = runner.invoke(cli, ['list-repositories', '--env', 'dev'])
            
            assert result.exit_code != 0
            assert "Failed to list repositories" in result.output
    
    def test_cli_help(self):
        """Test CLI help output."""
        runner = CliRunner()
        
        result = runner.invoke(cli, ['--help'])
        
        assert result.exit_code == 0
        assert "Foundry sync CLI tool" in result.output
        assert "sync-transforms" in result.output
        assert "list-repositories" in result.output
    
    def test_sync_transforms_help(self):
        """Test sync-transforms help output."""
        runner = CliRunner()
        
        result = runner.invoke(cli, ['sync-transforms', '--help'])
        
        assert result.exit_code == 0
        assert "Push local transforms and functions to Foundry" in result.output
        assert "--env" in result.output
        assert "--repository-rid" in result.output
        assert "--dry-run" in result.output
    
    def test_list_repositories_help(self):
        """Test list-repositories help output."""
        runner = CliRunner()
        
        result = runner.invoke(cli, ['list-repositories', '--help'])
        
        assert result.exit_code == 0
        assert "List available Foundry repositories" in result.output
        assert "--env" in result.output
    
    def test_file_listing_function(self):
        """Test the file listing helper function."""
        from scripts.sync_to_foundry import _list_files_to_upload
        
        # Mock os.walk to return test file structure
        mock_walk = [
            ('backend/transforms', ['ingestion', 'processing'], ['test1.py', 'test2.py']),
            ('backend/transforms/ingestion', [], ['wildfire_feed.py']),
            ('backend/transforms/processing', [], ['risk_processor.py'])
        ]
        
        with patch('os.walk', return_value=mock_walk):
            # This would normally log, but we can test the function exists and runs
            _list_files_to_upload('backend/transforms', 'transforms')
            # Function should complete without error
    
    def test_sync_transforms_environment_variables(self, mock_foundry_client):
        """Test sync with different environments."""
        runner = CliRunner()
        
        with patch('scripts.sync_to_foundry.FoundryClient') as mock_client_class:
            mock_client_class.return_value = mock_foundry_client
            
            with patch('os.path.exists', return_value=True):
                # Test different environments
                for env in ['dev', 'staging', 'prod']:
                    result = runner.invoke(cli, [
                        'sync-transforms',
                        '--env', env,
                        '--repository-rid', 'ri.test.repo.123'
                    ])
                    
                    assert result.exit_code == 0
                    assert f"environment={env}" in result.output
    
    def test_sync_transforms_default_paths(self, mock_foundry_client):
        """Test sync with default paths."""
        runner = CliRunner()
        
        with patch('scripts.sync_to_foundry.FoundryClient') as mock_client_class:
            mock_client_class.return_value = mock_foundry_client
            
            with patch('os.path.exists', return_value=True):
                result = runner.invoke(cli, [
                    'sync-transforms',
                    '--env', 'dev',
                    '--repository-rid', 'ri.test.repo.123'
                ])
                
                assert result.exit_code == 0
                # Should use default paths
                assert "transforms_path=backend/transforms" in result.output
                assert "functions_path=backend/functions" in result.output 