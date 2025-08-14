#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class APIKeyValidator {
    constructor() {
        this.configPath = path.join(__dirname, '..', 'config.env');
        this.results = {
            timestamp: new Date().toISOString(),
            api_keys: {},
            overall: { valid: 0, invalid: 0, total: 0 },
            details: []
        };
    }

    async init() {
        console.log(chalk.cyan.bold('\n🔑 API Key Validation'));
        console.log(chalk.cyan('===================\n'));

        // Check if running in Docker
        const isDocker = process.env.ENV_FILE || fs.existsSync('/.dockerenv');
        if (isDocker) {
            console.log(chalk.blue('🐳 Running in Docker container'));
        }

        // Load environment variables
        if (await fs.pathExists(this.configPath)) {
            const configContent = await fs.readFile(this.configPath, 'utf8');
            const envConfig = dotenv.parse(configContent);
            
            // Merge with process.env (prioritize system environment variables)
            // Only set config values if they're not already in process.env
            for (const [key, value] of Object.entries(envConfig)) {
                if (!process.env[key] || process.env[key] === `your_${key.toLowerCase()}_here`) {
                    process.env[key] = value;
                }
            }
            console.log(chalk.green('✅ Configuration loaded from config.env (system env vars prioritized)'));
        } else {
            console.log(chalk.yellow('⚠️  config.env not found, using system environment variables'));
        }

        // Show environment source
        console.log(chalk.gray(`Environment source: ${isDocker ? 'Docker container' : 'Host system'}`));
    }

    async validateElevenLabs() {
        console.log(chalk.cyan.bold('\n🎤 ElevenLabs API Key Validation'));
        console.log(chalk.cyan('==================================\n'));

        const apiKey = process.env.ELEVEN_API_KEY;
        const voiceId = process.env.ELEVEN_VOICE_ID;

        if (!apiKey || apiKey === 'your_elevenlabs_api_key_here') {
            this.addResult('ELEVEN_API_KEY', false, 'API key not set or using placeholder');
            console.log(chalk.red('❌ ELEVEN_API_KEY: Not configured'));
            return;
        }

        // Validate API key format (ElevenLabs keys are typically 40+ characters)
        if (apiKey.length < 40) {
            this.addResult('ELEVEN_API_KEY', false, 'API key format appears invalid (too short)');
            console.log(chalk.red('❌ ELEVEN_API_KEY: Format appears invalid'));
            return;
        }

        // Test API key by making a simple request
        try {
            const response = await fetch('https://api.elevenlabs.io/v1/voices', {
                headers: {
                    'xi-api-key': apiKey
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.addResult('ELEVEN_API_KEY', true, `Valid API key. Available voices: ${data.voices?.length || 0}`);
                console.log(chalk.green(`✅ ELEVEN_API_KEY: Valid (${data.voices?.length || 0} voices available)`));
                
                // Check if configured voice ID exists
                if (voiceId && data.voices) {
                    const voiceExists = data.voices.find(v => v.voice_id === voiceId);
                    if (voiceExists) {
                        console.log(chalk.green(`✅ Voice ID ${voiceId}: Valid (${voiceExists.name})`));
                    } else {
                        console.log(chalk.yellow(`⚠️  Voice ID ${voiceId}: Not found in available voices`));
                    }
                }
            } else if (response.status === 401) {
                this.addResult('ELEVEN_API_KEY', false, 'Invalid API key (401 Unauthorized)');
                console.log(chalk.red('❌ ELEVEN_API_KEY: Invalid (401 Unauthorized)'));
            } else {
                this.addResult('ELEVEN_API_KEY', false, `API error: ${response.status} ${response.statusText}`);
                console.log(chalk.red(`❌ ELEVEN_API_KEY: API error (${response.status})`));
            }
        } catch (error) {
            this.addResult('ELEVEN_API_KEY', false, `Network error: ${error.message}`);
            console.log(chalk.red(`❌ ELEVEN_API_KEY: Network error - ${error.message}`));
        }
    }

    async validateOpenAI() {
        console.log(chalk.cyan.bold('\n🤖 OpenAI API Key Validation'));
        console.log(chalk.cyan('==============================\n'));

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey || apiKey === 'your_openai_api_key_here') {
            this.addResult('OPENAI_API_KEY', false, 'API key not set or using placeholder');
            console.log(chalk.red('❌ OPENAI_API_KEY: Not configured'));
            return;
        }

        // Validate API key format (OpenAI keys start with 'sk-' and are 51 characters)
        if (!apiKey.startsWith('sk-') || apiKey.length !== 51) {
            this.addResult('OPENAI_API_KEY', false, 'API key format appears invalid (should start with sk- and be 51 chars)');
            console.log(chalk.red('❌ OPENAI_API_KEY: Format appears invalid'));
            return;
        }

        // Test API key by making a simple request
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.addResult('OPENAI_API_KEY', true, `Valid API key. Available models: ${data.data?.length || 0}`);
                console.log(chalk.green(`✅ OPENAI_API_KEY: Valid (${data.data?.length || 0} models available)`));
            } else if (response.status === 401) {
                this.addResult('OPENAI_API_KEY', false, 'Invalid API key (401 Unauthorized)');
                console.log(chalk.red('❌ OPENAI_API_KEY: Invalid (401 Unauthorized)'));
            } else {
                this.addResult('OPENAI_API_KEY', false, `API error: ${response.status} ${response.statusText}`);
                console.log(chalk.red(`❌ OPENAI_API_KEY: API error (${response.status})`));
            }
        } catch (error) {
            this.addResult('OPENAI_API_KEY', false, `Network error: ${error.message}`);
            console.log(chalk.red(`❌ OPENAI_API_KEY: Network error - ${error.message}`));
        }
    }

    async validateAzure() {
        console.log(chalk.cyan.bold('\n☁️  Azure Speech Services Validation'));
        console.log(chalk.cyan('====================================\n'));

        const apiKey = process.env.AZURE_SPEECH_KEY;
        const region = process.env.AZURE_SPEECH_REGION;

        if (!apiKey || apiKey === 'your_azure_speech_key_here') {
            this.addResult('AZURE_SPEECH_KEY', false, 'API key not set or using placeholder');
            console.log(chalk.red('❌ AZURE_SPEECH_KEY: Not configured'));
        } else {
            // Validate API key format (Azure keys are typically 32 characters)
            if (apiKey.length !== 32) {
                this.addResult('AZURE_SPEECH_KEY', false, 'API key format appears invalid (should be 32 characters)');
                console.log(chalk.red('❌ AZURE_SPEECH_KEY: Format appears invalid'));
            } else {
                this.addResult('AZURE_SPEECH_KEY', true, 'API key format appears valid');
                console.log(chalk.green('✅ AZURE_SPEECH_KEY: Format appears valid'));
            }
        }

        if (!region || region === 'eastus') {
            this.addResult('AZURE_SPEECH_REGION', false, 'Region not configured or using default');
            console.log(chalk.yellow('⚠️  AZURE_SPEECH_REGION: Not configured or using default'));
        } else {
            this.addResult('AZURE_SPEECH_REGION', true, `Region configured: ${region}`);
            console.log(chalk.green(`✅ AZURE_SPEECH_REGION: ${region}`));
        }

        // Test Azure Speech Services if both key and region are available
        if (apiKey && region && apiKey !== 'your_azure_speech_key_here' && region !== 'eastus') {
            try {
                const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
                    method: 'POST',
                    headers: {
                        'Ocp-Apim-Subscription-Key': apiKey,
                        'Content-Type': 'application/ssml+xml',
                        'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm'
                    },
                    body: '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="en-US-JennyNeural">Hello</voice></speak>'
                });

                if (response.ok) {
                    this.addResult('AZURE_SPEECH_SERVICES', true, 'API connection successful');
                    console.log(chalk.green('✅ Azure Speech Services: Connection successful'));
                } else if (response.status === 401) {
                    this.addResult('AZURE_SPEECH_SERVICES', false, 'Invalid API key (401 Unauthorized)');
                    console.log(chalk.red('❌ Azure Speech Services: Invalid API key (401)'));
                } else {
                    this.addResult('AZURE_SPEECH_SERVICES', false, `API error: ${response.status}`);
                    console.log(chalk.red(`❌ Azure Speech Services: API error (${response.status})`));
                }
            } catch (error) {
                this.addResult('AZURE_SPEECH_SERVICES', false, `Network error: ${error.message}`);
                console.log(chalk.red(`❌ Azure Speech Services: Network error - ${error.message}`));
            }
        }
    }

    async validateLoudly() {
        console.log(chalk.cyan.bold('\n🎵 Loudly API Key Validation'));
        console.log(chalk.cyan('============================\n'));

        const apiKey = process.env.LOUDLY_API_KEY;

        if (!apiKey || apiKey === 'your_loudly_api_key_here') {
            this.addResult('LOUDLY_API_KEY', false, 'API key not set or using placeholder');
            console.log(chalk.red('❌ LOUDLY_API_KEY: Not configured'));
            return;
        }

        // Validate API key format (Loudly keys are typically alphanumeric)
        if (apiKey.length < 10) {
            this.addResult('LOUDLY_API_KEY', false, 'API key format appears invalid (too short)');
            console.log(chalk.red('❌ LOUDLY_API_KEY: Format appears invalid'));
            return;
        }

        // Test API key by making a simple request
        try {
            const response = await fetch('https://api.loudly.com/v1/playlists', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            if (response.ok) {
                this.addResult('LOUDLY_API_KEY', true, 'Valid API key');
                console.log(chalk.green('✅ LOUDLY_API_KEY: Valid'));
            } else if (response.status === 401) {
                this.addResult('LOUDLY_API_KEY', false, 'Invalid API key (401 Unauthorized)');
                console.log(chalk.red('❌ LOUDLY_API_KEY: Invalid (401 Unauthorized)'));
            } else {
                this.addResult('LOUDLY_API_KEY', false, `API error: ${response.status} ${response.statusText}`);
                console.log(chalk.red(`❌ LOUDLY_API_KEY: API error (${response.status})`));
            }
        } catch (error) {
            this.addResult('LOUDLY_API_KEY', false, `Network error: ${error.message}`);
            console.log(chalk.red(`❌ LOUDLY_API_KEY: Network error - ${error.message}`));
        }
    }

    async validateOptionalKeys() {
        console.log(chalk.cyan.bold('\n🔧 Optional API Keys'));
        console.log(chalk.cyan('===================\n'));

        const optionalKeys = [
            { key: 'MUBERT_TOKEN', name: 'Mubert API' },
            { key: 'STABILITY_API_KEY', name: 'Stability AI' }
        ];

        for (const { key, name } of optionalKeys) {
            const value = process.env[key];
            if (!value || value === `your_${key.toLowerCase()}_here`) {
                this.addResult(key, false, 'Not configured (optional)');
                console.log(chalk.gray(`⚪ ${name}: Not configured (optional)`));
            } else {
                this.addResult(key, true, 'Configured');
                console.log(chalk.green(`✅ ${name}: Configured`));
            }
        }
    }

    addResult(key, valid, message) {
        this.results.api_keys[key] = valid;
        this.results.details.push({ key, valid, message, timestamp: new Date().toISOString() });
        
        if (valid) {
            this.results.overall.valid++;
        } else {
            this.results.overall.invalid++;
        }
        this.results.overall.total++;
    }

    async generateReport() {
        console.log(chalk.cyan.bold('\n📄 Generating Validation Report'));
        console.log(chalk.cyan('==============================\n'));

        const reportPath = path.join(__dirname, '..', 'out', 'api-key-validation-report.json');
        await fs.ensureDir(path.dirname(reportPath));
        await fs.writeJson(reportPath, this.results, { spaces: 2 });
        
        console.log(chalk.green(`✅ Validation report saved: ${reportPath}`));
        return reportPath;
    }

    async run() {
        try {
            await this.init();
            
                    await this.validateElevenLabs();
        await this.validateOpenAI();
        await this.validateAzure();
        // await this.validateLoudly(); // Disabled for now
        await this.validateOptionalKeys();
            
            const reportPath = await this.generateReport();

            console.log(chalk.cyan.bold('\n🎯 API Key Validation Summary'));
            console.log(chalk.cyan('==============================\n'));
            
            console.log(chalk.blue(`📊 Total Keys: ${this.results.overall.total}`));
            console.log(chalk.green(`✅ Valid: ${this.results.overall.valid}`));
            console.log(chalk.red(`❌ Invalid: ${this.results.overall.invalid}`));
            
            const successRate = ((this.results.overall.valid / this.results.overall.total) * 100).toFixed(1);
            console.log(chalk.blue(`📈 Success Rate: ${successRate}%`));

            if (this.results.overall.invalid === 0) {
                console.log(chalk.green('\n🎉 All API keys are valid!'));
            } else {
                console.log(chalk.yellow('\n⚠️  Some API keys need attention'));
                console.log(chalk.gray('Check the validation report for details'));
            }

            // Docker-specific guidance
            if (process.env.ENV_FILE || fs.existsSync('/.dockerenv')) {
                console.log(chalk.cyan.bold('\n🐳 Docker Container Setup Guide'));
                console.log(chalk.cyan('==============================\n'));
                console.log(chalk.blue('To configure API keys in Docker container:'));
                console.log(chalk.gray('1. Edit config.env file on host machine'));
                console.log(chalk.gray('2. Restart container: docker-compose restart'));
                console.log(chalk.gray('3. Or rebuild: docker-compose up --build'));
                console.log(chalk.gray('4. Run validation again: npm run validate:api'));
                console.log(chalk.gray('\nAlternative: Pass keys via docker-compose.yml environment section'));
            }

            return this.results.overall.invalid === 0;

        } catch (error) {
            console.error(chalk.red('❌ Error during validation:'), error);
            throw error;
        }
    }
}

// Run the API key validation
const validator = new APIKeyValidator();
validator.run().catch(console.error);
