import type { Metadata } from 'next'
import { MessageSquare } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Feedback',
  description: 'Send us your feedback and suggestions for HotScan.',
}

export default function FeedbackPage() {
  return (
    <div className="container max-w-2xl py-12 px-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <MessageSquare className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-3">Send Us Feedback</h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            We'd love to hear from you! Your feedback helps us improve HotScan.
          </p>
        </div>

        <div className="border rounded-lg p-8 space-y-4 text-left">
          <h2 className="text-xl font-semibold">Contact Options:</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong>GitHub Issues:</strong>{' '}
              <a
                href="https://github.com/Hacker0458/HotScan/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Report bugs or request features
              </a>
            </p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:feedback@hotscan.example" className="text-primary hover:underline">
                feedback@hotscan.example
              </a>
            </p>
            <p>
              <strong>Twitter/X:</strong>{' '}
              <span className="text-muted-foreground/70">(Coming soon)</span>
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground italic">
          * Formal feedback form coming soon! For now, please use the contact options above.
        </p>
      </div>
    </div>
  )
}

