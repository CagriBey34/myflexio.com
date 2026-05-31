import { cn } from '../../utils/helpers';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    disabled,
    loading,
    ...props
}) {
    const baseStyles = [
        'font-bold rounded-xl transition-all duration-200',
        'inline-flex items-center justify-center gap-2',
        'active:scale-[0.97]',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
    ].join(' ');

    const variants = {
        primary: [
            'bg-blue-600 text-white',
            'hover:bg-blue-700',
            'shadow-sm hover:shadow-md hover:shadow-blue-200',
            'focus:ring-blue-500',
            'disabled:bg-blue-300 disabled:shadow-none',
        ].join(' '),

        secondary: [
            'bg-slate-700 text-white',
            'hover:bg-slate-800',
            'shadow-sm hover:shadow-md hover:shadow-slate-200',
            'focus:ring-slate-500',
            'disabled:bg-slate-300 disabled:shadow-none',
        ].join(' '),

        outline: [
            'border-2 border-blue-600 text-blue-600 bg-transparent',
            'hover:bg-blue-50',
            'focus:ring-blue-500',
            'disabled:border-blue-200 disabled:text-blue-200',
        ].join(' '),

        ghost: [
            'text-blue-600 bg-transparent',
            'hover:bg-blue-50',
            'focus:ring-blue-400',
            'disabled:text-blue-200',
        ].join(' '),

        danger: [
            'bg-red-600 text-white',
            'hover:bg-red-700',
            'shadow-sm hover:shadow-md hover:shadow-red-200',
            'focus:ring-red-500',
            'disabled:bg-red-300 disabled:shadow-none',
        ].join(' '),

        green: [
            'bg-green-600 text-white',
            'hover:bg-green-700',
            'shadow-sm hover:shadow-md hover:shadow-green-200',
            'focus:ring-green-500',
            'disabled:bg-green-300 disabled:shadow-none',
        ].join(' '),

        'green-outline': [
            'border-2 border-green-600 text-green-600 bg-transparent',
            'hover:bg-green-50',
            'focus:ring-green-500',
            'disabled:border-green-200 disabled:text-green-200',
        ].join(' '),
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs tracking-wide',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-7 py-3.5 text-sm tracking-wide uppercase',
    };

    return (
        <button
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                (disabled || loading) && 'cursor-not-allowed opacity-50 pointer-events-none',
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Yükleniyor...
                </>
            ) : children}
        </button>
    );
}