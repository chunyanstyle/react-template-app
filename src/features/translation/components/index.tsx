interface HelloProps {
    text: string
    count?: number
    footer?: React.ReactNode
    onClick: () => void

}

export const Hello = ({text, onClick, footer}: HelloProps) => {
    return (
        <article>
            <p>{text}</p>
            <p>Hello World</p>
            <button onClick={onClick}>Click me</button>
            {footer}
        </article>
    )
}