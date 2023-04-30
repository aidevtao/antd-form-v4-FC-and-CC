import React, { Component } from "react";
import FieldContext from "./FieldContext"

export default class Field extends Component {
  // 获取context
  static contextType = FieldContext

  // 组件加载完毕后注册
  componentDidMount() {
    this.unregister = this.context.registerFieldEntities(this);
  }

  // 卸载时取消注册
  componentWillUnmount() {
    this.unregister();
  }

  // 强制更新方法
  onStoreChange = () => {
    this.forceUpdate();
  };

  // 使Input成为受控组件
  getControlled = () => {
    // 从context中获取操作权限
    const { getFieldValue, setFieldsValue } = this.context
    const { name } = this.props
    return {
      value: getFieldValue(name), //"omg", // get state
      onChange: (e) => {
        const newValue = e.target.value;
        // set state
        setFieldsValue({ [name]: newValue })
      },
    };
  };
  render() {
    console.log('field render');
    const { children } = this.props;

    const returnChildNode = React.cloneElement(children, this.getControlled());
    return returnChildNode;
  }

}