'use client'

import React from 'react'
import Image from 'next/image'
import { Calculator } from 'lucide-react'

interface LogoProps {
  className?: string
  showText?: boolean
  textClassName?: string
  iconSize?: 'sm' | 'md' | 'lg'
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  showText = true, 
  textClassName = '',
  iconSize = 'md'
}) => {
  // Icon size mapping
  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  // Check if custom logo exists, fallback to Calculator icon
  const [useCustomLogo, setUseCustomLogo] = React.useState(false)

  React.useEffect(() => {
    // Check if custom logo file exists
    const img = new window.Image()
    img.onload = () => setUseCustomLogo(true)
    img.onerror = () => setUseCustomLogo(false)
    img.src = '/icons/logo.svg'
  }, [])

  return (
    <div className={`flex items-center ${className}`}>
      {useCustomLogo ? (
        <Image
          src="/icons/logo.svg"
          alt="TheStatsCalculator Logo"
          width={iconSize === 'sm' ? 24 : iconSize === 'md' ? 32 : 48}
          height={iconSize === 'sm' ? 24 : iconSize === 'md' ? 32 : 48}
          className="object-contain"
          priority
        />
      ) : (
        <Calculator className={`${iconSizes[iconSize]} text-blue-500`} />
      )}
      
      {showText && (
        <span className={`ml-2 text-xl font-bold text-gray-900 ${textClassName}`}>
          TheStatsCalculator
        </span>
      )}
    </div>
  )
}

export default Logo