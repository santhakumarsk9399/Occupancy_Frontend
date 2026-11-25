import { useEffect, useRef, useState } from "react";

const Marquee = ({ text }) => {
    const textRef = useRef(null);
    const [duration, setDuration] = useState(10);

    useEffect(() => {
        if (textRef.current) {
            const width = textRef.current.offsetWidth;

            // pixels per second (speed control)
            const speed = 100;

            const time = width / speed;
            setDuration(time);
        }
    }, [text]);

    return (
        <div className="footer-marquee">
            <div
                className="footer-track"
                style={{ animationDuration: `${duration}s` }}
            >
                <span ref={textRef}>{text}</span>
                <span>{text}</span>
            </div>
        </div>
    );
};

export default Marquee;