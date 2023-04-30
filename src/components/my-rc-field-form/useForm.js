import { useRef } from "react"

class FormStore {
  constructor(props) {
    // 状态仓库
    this.store = {}
    // 组件实例注册list
    this.fieldEntities = [];
    // onFinish or onFinishFaild
    this.callbacks = {};
  }
  // 存储回调函数
  setCallbacks = (callbacks) => {
    this.callbacks = { ...this.callbacks, ...callbacks };
  };

  // 注册实例(forceUpdate)
  // 注册与取消注册
  // 订阅与取消订阅
  registerFieldEntities = (entity) => {
    this.fieldEntities.push(entity);

    return () => {
      // 删除已卸载的entity(组件实例) 即：不等于被卸载的组件被保留
      this.fieldEntities = this.fieldEntities.filter((item) => item !== entity);
      // 删除被卸载的组件的状态值
      delete this.store[entity.props.name];
    };
  };

  getFieldsValue = () => {
    // 这里解构是为了防止外界修改
    return { ...this.store }
  }

  getFieldValue = (name) => {
    return this.store[name]
  }

  setFieldsValue = (newStore) => {
    // 更新仓库
    this.store = {
      ...this.store,
      ...newStore,
    }
    // 更新 Field
    this.fieldEntities.forEach((entity) => {
      Object.keys(newStore).forEach((k) => {
        if (k === entity.props.name) {
          entity.onStoreChange();
        }
      });
    });
  }

  // 校验方法
  validate = () => {
    let err = [];
    // todo 校验
    // 简版校验

    this.fieldEntities.forEach((entity) => {
      const { name, rules } = entity.props;

      const value = this.getFieldValue(name);
      let rule = rules[0];

      if (rule && rule.required && (value === undefined || value === "")) {
        err.push({
          [name]: rule.message,
          value,
        });
      }
    });

    return err;
  };

  // 表单提交
  submit = () => {
    console.log("submit"); //sy-log

    let err = this.validate();
    // 提交
    const { onFinish, onFinishFailed } = this.callbacks;

    if (err.length === 0) {
      // 校验通过 把状态值传递过去
      onFinish(this.getFieldsValue());
    } else {
      // 校验不通过 把错误信息和轧辊台值传递过去
      onFinishFailed(err, this.getFieldsValue());
    }
  }

  getForm = () => {
    return {
      getFieldsValue: this.getFieldsValue,
      getFieldValue: this.getFieldValue,
      setFieldsValue: this.setFieldsValue,
      registerFieldEntities: this.registerFieldEntities,
      submit: this.submit,
      setCallbacks: this.setCallbacks,
    }
  }
}

// 自定义钩子 接收Form.js从FC中传递过来的form
export default function useForm(form) {
  // 存值，在组件卸载之前指向的都是同一个值
  // 把组件实例挂在在Fiber对象上。方式就是useRef这个api
  const formRef = useRef();

  if (!formRef.current) {
    // 如果是函数组件调用的Form组件，就有form
    if (form) {
      formRef.current = form;
      // 如果是类组件调用的Form组件，就没有form，我们需要实例化
    } else {
      const formStore = new FormStore();
      formRef.current = formStore.getForm();
    }
  }
  return [formRef.current];
}