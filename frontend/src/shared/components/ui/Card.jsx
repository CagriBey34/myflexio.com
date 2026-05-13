import { cn } from '../../utils/helpers';

export default function Card({ children, className, ...props }) {
    return (
        <div
            className={cn(
                'bg-white rounded-xl shadow-lg p-6',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
