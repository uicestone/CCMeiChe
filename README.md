# CCMeiChe


## API

version: v1
root: /api/v1

  ```
    /car
      PUT 新增我的车辆
      GET 获取我的所有车辆

    /address
      PUT 新增地址
      GET 获取我的所有地址

    /order
      POST 更新订单
      PUT 新增订单

    /signin
      POST 使用手机号验证码登录

    /signout

    /vcode
      GET 获取验证码

    /cartype
      GET 搜索车型提示

    /location/latlng?address=
      GET 获取经纬度
    /location/address?lat=&lng=
      GET 获取地址
  ```