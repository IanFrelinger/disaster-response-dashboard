#!/usr/bin/env node

import FeedbackPipeline from './feedback-pipeline.js';

const reason = process.argv[2] || 'No reason provided';
const pipeline = new FeedbackPipeline();
pipeline.rejectVideo(reason).catch(console.error);
