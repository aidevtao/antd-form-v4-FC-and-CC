import React from "react";
import FieldContext from "./FieldContext";
import useForm from "./useForm"

export default function Form({ children, form, onFinish, onFinishFailed }, ref) {
  // 直接调用useForm，并改名防止命名冲突. 当用户使用函数组件时候，我们可以把form作为参数传递给useForm
  const [formInstance] = useForm(form);
  // 将formInstance 反弹给祖先组件
  React.useImperativeHandle(ref, () => formInstance)
  // 将回调函数存储到状态管理库中
  formInstance.setCallbacks({
    onFinish,
    onFinishFailed,
  })
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      formInstance.submit()
    }}>
      <FieldContext.Provider value={formInstance}>
        {children}
      </FieldContext.Provider>
    </form>
  );
}
