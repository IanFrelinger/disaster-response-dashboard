#!/usr/bin/env node

import FeedbackPipeline from './feedback-pipeline.js';

const pipeline = new FeedbackPipeline();
pipeline.approveVideo().catch(console.error);
