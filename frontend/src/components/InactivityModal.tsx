interface InactivityModalProps {
  secondsLeft: number
  onStayActive: () => void
  onSignOut: () => void
}

const InactivityModal = ({ secondsLeft, onStayActive, onSignOut }: InactivityModalProps) => {
  return (
    // Overlay
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Still there?
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          You've been inactive for a while. For your security, we'll sign you out automatically.
        </p>
        <p className="text-sm text-gray-900 font-medium mb-6">
          Signing out in {secondsLeft} second{secondsLeft !== 1 ? 's' : ''}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onSignOut}
            className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg py-2 text-sm font-medium transition-colors"
          >
            Sign out now
          </button>
          <button
            onClick={onStayActive}
            className="flex-1 bg-gray-900 hover:bg-gray-700 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  )
}

export default InactivityModal