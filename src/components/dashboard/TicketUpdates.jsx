export default function TicketUpdates() {
  return (
    <div className="w-80 bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Updates to your tickets</h2>
      </div>
      
      <div className="overflow-y-auto h-[calc(100vh-5rem)]">
        {/* Sample Updates - We'll make this dynamic later */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border-b border-gray-200 hover:bg-gray-50">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
              </div>
              <div>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">System</span> assigned you ticket #{i}
                </p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 