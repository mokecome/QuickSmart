/**
 * Dialog Component
 * Modal dialog
 */
'use client'

import * as React from 'react'
import { cn } from '@/shared/lib/utils/cn'

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange?.(false)}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div className="relative z-50" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 p-6',
      'animate-in fade-in-0 zoom-in-95',
      className
    )}
    {...props}
  >
    {children}
  </div>
))
DialogContent.displayName = 'DialogContent'

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col space-y-1.5 mb-4', className)}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-500', className)}
    {...props}
  />
))
DialogDescription.displayName = 'DialogDescription'

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex items-center justify-end gap-2 mt-6', className)}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
