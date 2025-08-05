#!/usr/bin/env python3
"""
Sync script for pushing local transforms to Foundry.
"""

from foundry_sdk import FoundryClient
import click
import os
import structlog
from pathlib import Path

logger = structlog.get_logger(__name__)


@click.command()
@click.option('--env', default='dev', help='Environment (dev, staging, prod)')
@click.option('--repository-rid', help='Foundry repository RID')
@click.option('--transforms-path', default='backend/transforms', help='Path to transforms directory')
@click.option('--functions-path', default='backend/functions', help='Path to functions directory')
@click.option('--dry-run', is_flag=True, help='Show what would be uploaded without actually uploading')
def sync_transforms(env, repository_rid, transforms_path, functions_path, dry_run):
    """Push local transforms and functions to Foundry."""
    
    logger.info("Starting Foundry sync", 
                environment=env,
                transforms_path=transforms_path,
                functions_path=functions_path,
                dry_run=dry_run)
    
    try:
        # Initialize Foundry client
        client = FoundryClient()
        
        # Validate paths exist
        if not os.path.exists(transforms_path):
            raise click.ClickException(f"Transforms path does not exist: {transforms_path}")
        
        if not os.path.exists(functions_path):
            raise click.ClickException(f"Functions path does not exist: {functions_path}")
        
        if dry_run:
            logger.info("DRY RUN: Would upload the following:")
            _list_files_to_upload(transforms_path, "transforms")
            _list_files_to_upload(functions_path, "functions")
            return
        
        # Upload transforms
        if repository_rid:
            logger.info("Uploading transforms to repository", repository_rid=repository_rid)
            client.upload_repository(
                path=transforms_path,
                repository_rid=repository_rid
            )
            
            # Trigger build
            logger.info("Triggering repository build")
            client.build_repository(repository_rid=repository_rid)
        else:
            logger.warning("No repository RID provided, skipping upload")
        
        logger.info("Foundry sync completed successfully")
        
    except Exception as e:
        logger.error("Foundry sync failed", error=str(e))
        raise click.ClickException(f"Sync failed: {str(e)}")


def _list_files_to_upload(path, file_type):
    """List files that would be uploaded."""
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                logger.info(f"Would upload {file_type}: {file_path}")


@click.command()
@click.option('--env', default='dev', help='Environment (dev, staging, prod)')
def list_repositories(env):
    """List available Foundry repositories."""
    
    try:
        client = FoundryClient()
        repositories = client.list_repositories()
        
        click.echo(f"Available repositories in {env} environment:")
        for repo in repositories:
            click.echo(f"  - {repo['name']}: {repo['rid']}")
            
    except Exception as e:
        logger.error("Failed to list repositories", error=str(e))
        raise click.ClickException(f"Failed to list repositories: {str(e)}")


@click.group()
def cli():
    """Foundry sync CLI tool."""
    pass


cli.add_command(sync_transforms)
cli.add_command(list_repositories)


if __name__ == '__main__':
    cli() 