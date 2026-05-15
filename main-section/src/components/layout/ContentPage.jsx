import NavigationBar from '../NavigationBar';

const ContentPage = ({ children, pageClassName = 'page-container', wrapperClassName = 'content-wrapper-narrow' }) => (
  <>
    <NavigationBar />
    <div className={pageClassName}>
      <div className={wrapperClassName}>{children}</div>
    </div>
  </>
);

export default ContentPage;
