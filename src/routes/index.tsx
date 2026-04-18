import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="grid h-screen place-items-center">
      <div className="flex flex-col items-start gap-2">
        <pre className="rounded-md bg-neutral-100 px-2 py-0.5">pnpm dlx shadcn@latest init</pre>
        <pre className="rounded-md bg-neutral-100 px-2 py-0.5">
          pnpm dlx shadcn@latest add @coss/button @coss/colors-neutral
        </pre>
      </div>
    </div>
  )
}
