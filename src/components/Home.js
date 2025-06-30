import React, { Fragment } from 'react';
import '@mdi/font/css/materialdesignicons.min.css';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const Home = () => {
    return(
    <Fragment>
        <Helmet><title>Quiz App - Home</title></Helmet>
    <div id="home">
       <section>
        <div style={{ textAlign : 'center' }}>
            <span className="mdi mdi-cube-outline  cube"></span>
        </div>
        <h1>Quiz App</h1>
        <div className='play-button-container'>
          <ul>
            <li><Link to="/play/instructions" className='play-btn' >Play</Link></li>
          </ul>
        </div>
        <div className='auth-container'>
            <Link to="/Login" className='auth-btn' id='login' >Login</Link>
             <Link to="/Register" className='auth-btn' id='register' >Register</Link>
        </div>
       </section>
    </div>
    </Fragment>
    );
};

export default Home;