import React from 'react';
//import heroImage from '../../../Assets/Images/hero-image.png';
//import productImage from '../../../Assets/Images/product-overview.png';
import logo from '../../../assets/images/vairo-logo.png';
import { ReactComponent as EngageIcon } from '../../../assets/icons/engage-icon.svg';
import { ReactComponent as CommunityIcon } from '../../../assets/icons/circles-icon.svg';
import { ReactComponent as GrowthIcon } from '../../../assets/icons/graph-icon.svg';
//import Divider from '../../../components/landing/Divider/Divider'
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div>
            <section className="hero-home">
                <div className="container">
                    <div className="hero-content">
                        <h1>Analytics for Your Business</h1>
                        <h2>Built from the Ground up with AI</h2>
                        <p>
                            Boost engagement and deliver exceptional value to your members with a platform
                            that makes strategic partnerships and collaboration effortless.
                        </p>
                        <div className="cta-buttons">
                            <Link to="/demo" className="join-demo">Request Demo</Link>
                        </div>
                    </div>
                    {/* <div className="product-image">
                        <img src={productImage} alt="Product" />
                    </div> */}
                </div>
                {/* <div className="hero-image">
                    <img src={heroImage} alt="Hero" />
                </div> */}
            </section>

            <section id="why-chambers">
                <div className="section-title">
                    <div className="Filo-logo">
                        <img src={logo} alt="Company Logo" />
                    </div>
                    <h3>Why Chambers Choose Filo</h3>
                </div>
                <div className="reasons">
                    <div className="reason">
                        <EngageIcon className='reason-icon'/>
                        <h4>Engagement</h4>
                        <h5>Improve Member Engagement</h5>
                        <p>
                            Filo helps maximize the impact of networking by facilitating partnerships, 
                            streamlining referrals, and turning connections into valuable opportunities.
                        </p>
                    </div>
                    <div className="reason">
                        <CommunityIcon className='reason-icon'/>
                        <h4>Community</h4>
                        <h5>Build a Collaborative Community</h5>
                        <p>
                            Filo fosters community by encouraging collaboration and partnerships among members, 
                            helping businesses support one another and grow together.
                        </p>
                    </div>
                    <div className="reason">
                        <GrowthIcon className='reason-icon'/>
                        <h4>Growth</h4>
                        <h5>Retain and Grow Membership</h5>
                        <p>
                            Attract younger business owners with modern technology that tracks 
                            and showcases the tangible value created through Chamber networking.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;