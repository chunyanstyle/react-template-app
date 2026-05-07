import { createFileRoute } from '@tanstack/react-router'
import { Hello } from '@/features/translation/components'

export const Route = createFileRoute('/user')({
  component: RouteComponent,

})

function Footer() {
  return <p>Footer</p>
}

function RouteComponent() {

  const handleClick = () => {
    console.log('clicked')
  }

  return (
    <Hello text={'Hello World'} onClick={handleClick} footer={<Footer />} />
  )
}
