import PageHeader from '../components/ui/PageHeader'

export default function PlaceholderPage({ title, description }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm font-medium text-slate-700">Module shell ready</p>
        <p className="mt-2 text-sm text-slate-500">
          CRUD screens and API integration will be added in the next phase.
        </p>
      </div>
    </div>
  )
}
