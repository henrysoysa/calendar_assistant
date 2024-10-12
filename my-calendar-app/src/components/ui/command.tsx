import React from 'react'

interface CommandProps {
  children: React.ReactNode;
  [key: string]: any; // for other props
}

const Command: React.FC<CommandProps> = ({ children, ...props }) => {
  return <div {...props}>{children}</div>
}

export { Command }

