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

    const draw = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: (i: number) => {
            const delay = i * 0.2;
            return {
                pathLength: 1,
                opacity: 1,
                transition: {
                    pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
                    opacity: { delay, duration: 0.1 }
                }
            };
        }
    };

    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 25 25"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {/* Main Flame Path 1 */}
            <Path
                d="M13 2 C15 10 -6 16 12 21 C1 14 16 10 13 2 Z"
                {...(animated && {
                    variants: draw,
                    initial: "hidden",
                    animate: "visible",
                    custom: 0
                })}
            />

            {/* Main Flame Path 2 */}
            <Path
                d="M13 22 C31 18 16 14 16 10 C15 15 25 17 13 22 Z"
                {...(animated && {
                    variants: draw,
                    initial: "hidden",
                    animate: "visible",
                    custom: 1
                })}
            />

            {/* Inner Flame Path 3 */}
            <Path
                d="M13 19 C11 19 11 18 12 16 S13 13 13 12 C15 13 17 19 13 19 Z"
                {...(animated && {
                    variants: draw,
                    initial: "hidden",
                    animate: "visible",
                    custom: 2
                })}
            />

            {/* Spark 1 */}
            <Path
                d="M24 5 Q21 5 21 2 Q21 5 18 5 Q21 5 21 8 Q21 5 24 5 Z"
                {...(animated && {
                    variants: draw,
                    initial: "hidden",
                    animate: "visible",
                    custom: 3
                })}
            />

            {/* Spark 2 */}
            <Path
                d="M3 20 Q3 22 1 22 Q3 22 3 24 Q3 22 5 22 Q3 22 3 20 Z"
                {...(animated && {
                    variants: draw,
                    initial: "hidden",
                    animate: "visible",
                    custom: 4
                })}
            />
        </motion.svg>
    );
}
