import ToastItem from './ToastItem';
import ReactDOM from 'react-dom';

const Toast = {
  dom: null,
  success(content: any, duration?: any) {
    // 创建一个dom
    let dom = document.createElement('div');
    // 定义组件，
    const JSXdom = (<ToastItem content={content} duration={duration} type='success' />);
    // 渲染DOM
    ReactDOM.render(JSXdom, dom);
    // 置入到body节点下
    document.body.appendChild(dom);
  },
  error(content: any, duration?: any) {
    let dom = document.createElement('div');
    const JSXdom = (<ToastItem content={content} duration={duration} type='error' />);
    ReactDOM.render(JSXdom, dom);
    document.body.appendChild(dom);
  },
  warning(content: any, duration?: any) {
    let dom = document.createElement('div');
    const JSXdom = (<ToastItem content={content} duration={duration} type='warning' />);
    ReactDOM.render(JSXdom, dom);
    document.body.appendChild(dom);
  },
  info(content: any, duration?: any) {
    let dom = document.createElement('div');
    const JSXdom = (<ToastItem content={content} duration={duration} type='info' />);
    ReactDOM.render(JSXdom, dom);
    document.body.appendChild(dom);
  }
};

export default Toast;
