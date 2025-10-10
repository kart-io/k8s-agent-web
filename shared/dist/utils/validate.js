/**
 * 表单验证工具函数
 */

/**
 * 验证邮箱
 */
function validateEmail(rule, value, callback) {
  if (!value) {
    callback();
    return
  }

  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!reg.test(value)) {
    callback(new Error('请输入正确的邮箱地址'));
  } else {
    callback();
  }
}

/**
 * 验证手机号
 */
function validatePhone(rule, value, callback) {
  if (!value) {
    callback();
    return
  }

  const reg = /^1[3-9]\d{9}$/;
  if (!reg.test(value)) {
    callback(new Error('请输入正确的手机号码'));
  } else {
    callback();
  }
}

/**
 * 验证身份证号
 */
function validateIdCard(rule, value, callback) {
  if (!value) {
    callback();
    return
  }

  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  if (!reg.test(value)) {
    callback(new Error('请输入正确的身份证号码'));
  } else {
    callback();
  }
}

/**
 * 验证密码强度
 * 至少8位，包含大小写字母、数字和特殊字符
 */
function validatePassword(rule, value, callback) {
  if (!value) {
    callback();
    return
  }

  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

  if (value.length < minLength) {
    callback(new Error(`密码长度至少${minLength}位`));
  } else if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
    callback(new Error('密码必须包含大小写字母、数字和特殊字符'));
  } else {
    callback();
  }
}

/**
 * 验证URL
 */
function validateUrl(rule, value, callback) {
  if (!value) {
    callback();
    return
  }

  const reg = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  if (!reg.test(value)) {
    callback(new Error('请输入正确的URL地址'));
  } else {
    callback();
  }
}

/**
 * 验证IP地址
 */
function validateIP(rule, value, callback) {
  if (!value) {
    callback();
    return
  }

  const reg = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  if (!reg.test(value)) {
    callback(new Error('请输入正确的IP地址'));
  } else {
    callback();
  }
}

/**
 * 验证端口号
 */
function validatePort(rule, value, callback) {
  if (!value) {
    callback();
    return
  }

  const port = parseInt(value, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    callback(new Error('端口号范围为1-65535'));
  } else {
    callback();
  }
}

/**
 * 验证中文
 */
function validateChinese(rule, value, callback) {
  if (!value) {
    callback();
    return
  }

  const reg = /^[\u4e00-\u9fa5]+$/;
  if (!reg.test(value)) {
    callback(new Error('请输入中文'));
  } else {
    callback();
  }
}

/**
 * 验证英文字母
 */
function validateEnglish(rule, value, callback) {
  if (!value) {
    callback();
    return
  }

  const reg = /^[a-zA-Z]+$/;
  if (!reg.test(value)) {
    callback(new Error('请输入英文字母'));
  } else {
    callback();
  }
}

/**
 * 验证数字
 */
function validateNumber(rule, value, callback) {
  if (!value && value !== 0) {
    callback();
    return
  }

  if (isNaN(Number(value))) {
    callback(new Error('请输入数字'));
  } else {
    callback();
  }
}

/**
 * 验证整数
 */
function validateInteger(rule, value, callback) {
  if (!value && value !== 0) {
    callback();
    return
  }

  const reg = /^-?\d+$/;
  if (!reg.test(value)) {
    callback(new Error('请输入整数'));
  } else {
    callback();
  }
}

/**
 * 验证正整数
 */
function validatePositiveInteger(rule, value, callback) {
  if (!value && value !== 0) {
    callback();
    return
  }

  const reg = /^\d+$/;
  const num = parseInt(value, 10);

  if (!reg.test(value) || num <= 0) {
    callback(new Error('请输入正整数'));
  } else {
    callback();
  }
}

/**
 * 验证范围
 */
function validateRange(min, max) {
  return function (rule, value, callback) {
    if (!value && value !== 0) {
      callback();
      return
    }

    const num = Number(value);
    if (isNaN(num)) {
      callback(new Error('请输入数字'));
    } else if (num < min || num > max) {
      callback(new Error(`请输入${min}-${max}之间的数字`));
    } else {
      callback();
    }
  }
}

/**
 * 验证长度范围
 */
function validateLength(min, max) {
  return function (rule, value, callback) {
    if (!value) {
      callback();
      return
    }

    const length = value.length;
    if (length < min || length > max) {
      callback(new Error(`长度必须在${min}-${max}之间`));
    } else {
      callback();
    }
  }
}

export { validateChinese, validateEmail, validateEnglish, validateIP, validateIdCard, validateInteger, validateLength, validateNumber, validatePassword, validatePhone, validatePort, validatePositiveInteger, validateRange, validateUrl };
//# sourceMappingURL=validate.js.map
