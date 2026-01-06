import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">What we collect</h2>
            <p>
              We collect only the information necessary to run the Plank Tracker competition:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Email address (for login)</li>
              <li>Display name (shown on leaderboard)</li>
              <li>Plank attempt times and dates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">How we use your data</h2>
            <p>
              Your data is used solely for the plank competition. We display your
              display name and best times on the leaderboard visible to other participants.
              Your email is never shared publicly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Data storage</h2>
            <p>
              Your data is stored securely on Railway&apos;s infrastructure. Passwords are
              hashed and never stored in plain text.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your rights</h2>
            <p>
              You can request deletion of your account and all associated data at any time.
              Contact the administrator to exercise this right.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Third parties</h2>
            <p>
              We do not share your data with any third parties. This is a private
              competition among friends.
            </p>
          </section>
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
