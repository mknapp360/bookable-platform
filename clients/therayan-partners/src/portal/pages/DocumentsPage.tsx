import { FileText } from 'lucide-react'

export function DocumentsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Documents</h1>
      <p className="text-sm text-gray-500 mb-8">Documents shared with you by Thérayan Partners.</p>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <FileText size={28} className="text-slate-400" />
        </div>
        <p className="text-gray-500 text-sm">No documents yet.</p>
        <p className="text-gray-400 text-xs mt-1">Documents will appear here once they're shared with you.</p>
      </div>
    </div>
  )
}
