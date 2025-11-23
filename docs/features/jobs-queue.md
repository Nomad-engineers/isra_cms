# Jobs Queue

Payload's Jobs Queue gives you a simple, yet powerful way to offload large or future tasks to separate compute resources which is a very powerful feature of many application frameworks.

## Example Use Cases

### Non-blocking Workloads

You might need to perform some complex, slow-running logic in a Payload [Hook](../hooks/overview.md) but you don't want that hook to "block" or slow down the response returned from the Payload API. Instead of running this logic directly in a hook, which would block your API response from returning until the expensive work is completed, you can queue a new Job and let it run at a later date.

Examples:
- Create vector embeddings from your documents, and keep them in sync as your documents change
- Send data to a third-party API on document change
- Trigger emails based on customer actions

### Scheduled Actions

If you need to schedule an action to be run or processed at a certain date in the future, you can queue a job with the `waitUntil` property set. This will make it so the job is not "picked up" until that `waitUntil` date has passed.

Examples:
- Process scheduled posts, where the scheduled date is at a time set in the future
- Unpublish posts at a given time
- Send a reminder email to a customer after X days of signing up for a trial

### Periodic Actions

Some applications may need to perform a regularly scheduled operation of some type. Jobs are perfect for this because you can execute their logic using `cron`, scheduled nightly, every twelve hours, or some similar time period.

Examples:
- You'd like to send emails to all customers on a regular, scheduled basis
- Periodically trigger a rebuild of your frontend at night
- Sync resources to or from a third-party API during non-peak times

### Offloading Complex Operations

You may run into the need to perform computationally expensive functions which might slow down your main Payload API server(s). The Jobs Queue allows you to offload these tasks to a separate compute resource rather than slowing down the server(s) that run your Payload APIs. With Payload Task definitions, you can even keep large dependencies out of your main Next.js bundle by dynamically importing them only when they are used. This keeps your Next.js + Payload compilation fast and ensures large dependencies do not get bundled into your Payload production build.

Examples:
- You need to create (and then keep in sync) vector embeddings of your documents as they change, but you use an open source model to generate embeddings
- You have a PDF generator that needs to dynamically build and send PDF versions of documents to customers
- You need to use a headless browser to perform some type of logic
- You need to perform a series of actions, each of which depends on a prior action and should be run in as "durable" of a fashion as possible

## How It Works

There are a few concepts that you should become familiarized with before using Payload's Jobs Queue. We recommend learning what each of these does in order to fully understand how to leverage the power of Payload's Jobs Queue.

- **[Tasks](./jobs-queue/tasks.md)**: Tasks are a specific function that performs business logic
- **[Workflows](./jobs-queue/workflows.md)**: Workflows are groupings of specific tasks which should be run in-order, and can be retried from a specific point of failure
- **[Jobs](./jobs-queue/jobs.md)**: Jobs are an instance of a single task or workflow which will be executed
- **[Queues](./jobs-queue/queues.md)**: Queues are a way to segment your jobs into different "groups" - for example, some to run nightly, and others to run every 10 minutes

All of these pieces work together in order to allow you to offload long-running, expensive, or future scheduled work from your main APIs.

Here's a quick overview:
- A Task is a specific function that performs business logic
- Workflows are groupings of specific tasks which should be run in-order, and can be retried from a specific point of failure
- A Job is an instance of a single task or workflow which will be executed
- A Queue is a way to segment your jobs into different "groups" - for example, some to run nightly, and others to run every 10 minutes

## Visualizing Jobs in the Admin UI

By default, the internal `payload-jobs` collection is hidden from the Payload Admin Panel. To make this collection visible for debugging or inspection purposes, you can override its configuration using `jobsCollectionOverrides`.

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  // ... other config
  jobs: {
    // ... other job settings
    jobsCollectionOverrides: ({ defaultJobsCollection }) => {
      if (!defaultJobsCollection.admin) {
        defaultJobsCollection.admin = {}
      }

      defaultJobsCollection.admin.hidden = false
      return defaultJobsCollection
    },
  },
})
```

## Getting Started

To start using the Jobs Queue:

1. **Configure jobs in your Payload config**
2. **Define tasks** for the work you want to perform
3. **Create workflows** if you need to chain multiple tasks
4. **Queue jobs** from your hooks, API routes, or other parts of your application
5. **Process jobs** using the built-in job runner or custom worker

The Jobs Queue provides a robust foundation for handling asynchronous work in your Payload application, improving performance and reliability while keeping your API responses fast.