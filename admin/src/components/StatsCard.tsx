import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';


interface StatsCardProps{
    title:string;
    value:string | number;
    description?:string;
    icon?:React.ReactNode;
    className?:string;
    href?:string;
}

const StatsCard = ({title,value,description,icon,className,href}:StatsCardProps) => {
  return (
    <Card className={cn("overflow-hidden relative w-[210px] ",className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className='text-sm font-medium'>{title}</CardTitle>
            {icon && <div className='h-4 w-4 '>{icon}</div>}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
                <p className='text-xs text-muted-foreground mt-1'>{description}</p>
            )}
        </CardContent>
        <Link to={href!}
        className='absolute inset-0'
        aria-label={`View ${title} details!`}></Link>
    </Card>

  )
}

export default StatsCard