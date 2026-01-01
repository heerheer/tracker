import { motion } from "framer-motion";

interface FlameTorchIconProps {
    size?: number;
    strokeWidth?: number;
    animated?: boolean;
    color?: string;
    className?: string;
}

export function FlameTorchIcon({
    size = 24,
    strokeWidth = 1.5,
    animated = true,
    color = "currentColor",
    className
}: FlameTorchIconProps) {
    const Path = animated ? motion.path : "path";

    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {/* 三分叉火焰轮廓 */}
            <Path
                d="M7 14c-1-3 1-6 2-7c0 2 1 3 1 3c1-4 2-8 2-8s1 4 2 8c0 0 1-1 1-3c1 1 3 4 2 7"
                {...(animated && {
                    initial: { pathLength: 0, opacity: 0 },
                    animate: { pathLength: 1, opacity: 1 },
                    transition: {
                        duration: 1.2,
                        ease: "easeInOut",
                    },
                })}
            />

            {/* 火把底座 / 手柄 */}
            <Path
                d="M9 14l1.5 8h3L15 14"
                {...(animated && {
                    initial: { pathLength: 0 },
                    animate: { pathLength: 1 },
                    transition: {
                        duration: 0.8,
                        delay: 0.3,
                        ease: "easeOut",
                    },
                })}
            />

            {/* 内部装饰线条 */}
            <Path
                d="M12 11c0 1-1 2-1 2"
                {...(animated && {
                    animate: {
                        opacity: [0.4, 1, 0.4],
                    },
                    transition: {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    },
                })}
            />
        </motion.svg>
    );
}
