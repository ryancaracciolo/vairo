import React, { useState, useEffect, useRef, useCallback } from 'react';
import './HowItWorks.css';
import PageOne from '../../../assets/images/vairo-logo-light.png'
import PageTwo from '../../../assets/images/vairo-logo-light.png'
import PageThree from '../../../assets/images/vairo-logo-light.png'



const HowItWorks = () => {
    const [activeSection, setActiveSection] = useState(0);
    const targetRef = useRef(null);
    const lineRef = useRef(null);
    const [lineHeight, setLineHeight] = useState(0);

    const sectionRefs = [useRef(null), useRef(null), useRef(null)]; // Adjust the number based on sections

    const handleScroll = useCallback(() => {
        sectionRefs.forEach((ref, index) => {
          const sectionTop = ref.current.getBoundingClientRect().top;
          const triggerPoint = window.innerHeight / 2; // Halfway point of the viewport
          if (sectionTop < triggerPoint) {
            setActiveSection(index + 1); // Update the active section based on scroll
          } else if (index === 0) {
            setActiveSection (index); // Brings activeSection back to zero when user scrolls back up
          }
        });
      }, [sectionRefs]); // Include only necessary dependencies

    const updateLineHeight = () => {
        const targetElement = targetRef.current;
        const lineElement = lineRef.current;

        if (targetElement && lineElement) {
            // Calculate the center of the screen
            const screenCenterY = window.innerHeight / 2;

            // Calculate the top position of the target element relative to the document
            const targetPositionY = targetElement.getBoundingClientRect().top;

            const heightDifference = Math.max(screenCenterY - targetPositionY, 0);
            const maxHeight = targetElement.getBoundingClientRect().height; // Set your desired maximum height in pixels
            const adjustedHeight = Math.min(heightDifference, maxHeight);

            setLineHeight(adjustedHeight);
        }
    };

    useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
    // Update line height on load and on scroll/resize
    updateLineHeight();
    window.addEventListener('resize', updateLineHeight);
    window.addEventListener('scroll', updateLineHeight);

    // Clean up event listeners
    return () => {
        window.removeEventListener('resize', updateLineHeight);
        window.removeEventListener('scroll', updateLineHeight);
    };
    }, []);

    return (
    <div className="how-it-works">
        <h1 className='header'>How It Works</h1>
        <div className="content-sections">
            <div className='section'>
                <div className='illustration design-one'></div>
                <div className="text-content" ref={sectionRefs[0]}>
                    <div className='text'>
                        <h2>STEP 1</h2>
                        <h3>Find Partnerships</h3>
                        <p>It’s like LinkedIn for partnerships. Members can find and connect with the companies in their partner ecosystem in just a few clicks.</p>
                    </div>
                </div>
                <div className={`circle ${activeSection >= 1 ? 'active' : ''}`}><span className="number">1</span></div>
                <div className="image-content">
                    <img src={PageOne} alt="How It Works" />
                </div>
            </div>
            <div className='section'>
                <div className="image-content two">
                    <img id='referral' src={PageTwo} alt="How It Works" />
                </div>
                <div className={`circle ${activeSection >= 2 ? 'active' : ''}`}><span className="number">2</span></div>
                <div className="text-content one" ref={sectionRefs[1]}>
                    <div className='text'>
                        <h2>STEP 2</h2>
                        <h3>Send and Receive Referrals</h3>
                        <p>Make the most of networking. Members can send and receive promising business opportunities with ease. 
                            Strengthen business connections and turn them into valuable partnerships.</p>
                    </div>
                </div>
                <div className='illustration design-two'></div>
            </div>
            <div className='section'>
                <div className="text-content" ref={sectionRefs[2]}>
                    <div className='text'>
                        <h2>STEP 3</h2>
                        <h3>Track Opportunities</h3>
                        <p>Track opportunities effortlessly. Members stay on top of every business lead and referral, 
                            ensuring no opportunity slips through the cracks and partnerships are beneficial.</p>
                    </div>
                </div>
                <div className={`circle ${activeSection >= 3 ? 'active' : ''}`}><span className="number">3</span></div>
                <div className="image-content">
                    <img src={PageThree} alt="How It Works" />
                </div>
                <div className='illustration design-three'></div>
            </div>
            <div className="dynamic-line-container">
                <div ref={targetRef} className="line">
                </div>
                <div
                    ref={lineRef}
                    className="dynamic-line"
                    style={{ height: `${lineHeight}px` }}
                ></div>
            </div>
        </div>
    </div>
    );
    };

    export default HowItWorks;
