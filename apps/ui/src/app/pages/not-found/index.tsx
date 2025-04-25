import React from 'react';
import { NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>404 Not Found</title>
      </Helmet>

      <div
        className="flex justify-content-center h-full w-full m-0 py-7 px-4"
        style={{
          borderRadius: '53px',
          background:
            'linear-gradient(180deg, var(--surface-50) 38.9%, var(--surface-0))',
        }}
      >
        <div className="grid flex-column align-items-center">
          <span className="text-blue-500 font-bold text-3xl">404</span>
          <h1 className="text-900 font-bold text-3xl lg:text-5xl mb-2">
            Looks like you are lost
          </h1>
          <span className="text-600">Requested resource is not available.</span>
          <div className="col-12 mt-5 text-center">
            <i
              className="pi pi-fw pi-arrow-left text-blue-500 mr-2"
              style={{ verticalAlign: 'center' }}
            ></i>
            <NavLink to="/dashboard">
              <a href="#" className="text-blue-500">
                Go to Dashboard
              </a>
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
