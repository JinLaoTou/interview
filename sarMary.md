# 一、react

## 1、对React事件机制的理解



![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRjRBibQvZI8Q6u0v507nnZWSJiaEc7s43A7DZnQkPibWbxTr1DOGPa20dr8ibDwJfw9SkTjIDz3D59TQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

`React`基于浏览器的事件机制自身实现了一套事件机制，包括事件注册、事件的合成、事件冒泡、事件派发等

在`React`中这套事件机制被称之为合成事件

### 合成事件（SyntheticEvent）

合成事件是 `React`模拟原生 `DOM`事件所有能力的一个事件对象，即浏览器原生事件的跨浏览器包装器

根据 `W3C`规范来定义合成事件，兼容所有浏览器，拥有与浏览器原生事件相同的接口，例如：

```
const button = <button onClick={handleClick}>按钮</button>
```

如果想要获得原生`DOM`事件，可以通过`e.nativeEvent`属性获取

```
const handleClick = (e) => console.log(e.nativeEvent);;
const button = <button onClick={handleClick}>按钮</button>
```

从上面可以看到`React`事件和原生事件也非常的相似，但也有一定的区别：

- 事件名称命名方式不同

```
// 原生事件绑定方式
<button onclick="handleClick()">按钮命名</button>
      
// React 合成事件绑定方式
const button = <button onClick={handleClick}>按钮命名</button>
```

- 事件处理函数书写不同

```
// 原生事件 事件处理函数写法
<button onclick="handleClick()">按钮命名</button>
      
// React 合成事件 事件处理函数写法
const button = <button onClick={handleClick}>按钮命名</button>
```

虽然`onclick`看似绑定到`DOM`元素上，但实际并不会把事件代理函数直接绑定到真实的节点上，而是把所有的事件绑定到结构的最外层，使用一个统一的事件去监听

这个事件监听器上维持了一个映射来保存所有组件内部的事件监听和处理函数。当组件挂载或卸载时，只是在这个统一的事件监听器上插入或删除一些对象

当事件发生时，首先被这个统一的事件监听器处理，然后在映射里找到真正的事件处理函数并调用。这样做简化了事件处理和回收机制，效率也有很大提升

### 二、执行顺序

关于`React`合成事件与原生事件执行顺序，可以看看下面一个例子：

```
import  React  from 'react';
class App extends React.Component{

  constructor(props) {
    super(props);
    this.parentRef = React.createRef();
    this.childRef = React.createRef();
  }
  componentDidMount() {
    console.log("React componentDidMount！");
    this.parentRef.current?.addEventListener("click", () => {
      console.log("原生事件：父元素 DOM 事件监听！");
    });
    this.childRef.current?.addEventListener("click", () => {
      console.log("原生事件：子元素 DOM 事件监听！");
    });
    document.addEventListener("click", (e) => {
      console.log("原生事件：document DOM 事件监听！");
    });
  }
  parentClickFun = () => {
    console.log("React 事件：父元素事件监听！");
  };
  childClickFun = () => {
    console.log("React 事件：子元素事件监听！");
  };
  render() {
    return (
      <div ref={this.parentRef} onClick={this.parentClickFun}>
        <div ref={this.childRef} onClick={this.childClickFun}>
          分析事件执行顺序
        </div>
      </div>
    );
  }
}
export default App;
```

输出顺序为：

```
原生事件：子元素 DOM 事件监听！ 
原生事件：父元素 DOM 事件监听！ 
React 事件：子元素事件监听！ 
React 事件：父元素事件监听！ 
原生事件：document DOM 事件监听！ 
```

可以得出以下结论：

- React 所有事件都挂载在 document 对象上
- 当真实 DOM 元素触发事件，会冒泡到 document 对象后，再处理 React 事件
- 所以会先执行原生事件，然后处理 React 事件
- 最后真正执行 document 上挂载的事件

对应过程如图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRjRBibQvZI8Q6u0v507nnZWvULQAvicDQcGKU4yUvn1ZjTibQyuRtJYYu0yg0mPIDrEN1WFG33J0dvg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

所以想要阻止不同时间段的冒泡行为，对应使用不同的方法，对应如下：

- 阻止合成事件间的冒泡，用e.stopPropagation()
- 阻止合成事件与最外层 document 上的事件间的冒泡，用e.nativeEvent.stopImmediatePropagation()
- 阻止合成事件与最外层document上的原生事件上的冒泡，通过判断e.target来避免

```
document.body.addEventListener('click', e => {   
    if (e.target && e.target.matches('div.code')) {  
        return;    
    }    
    this.setState({   active: false,    });   }); 
}
```

### 三、总结

`React`事件机制总结如下：

- React 上注册的事件最终会绑定在document这个 DOM 上（react17之后绑定在根Root上面），而不是 React 组件对应的 DOM(减少内存开销就是因为所有的事件都绑定在 document 上，其他节点没有绑定事件)
- React 自身实现了一套事件冒泡机制，所以这也就是为什么我们 event.stopPropagation()无效的原因。
- React 通过队列的形式，从触发的组件向父组件回溯，然后调用他们 JSX 中定义的 callback
- React 有一套自己的合成事件 SyntheticEvent

### 参考文献

- https://zh-hans.reactjs.org/docs/events.html
- https://segmentfault.com/a/1190000015725214?utm_source=sf-similar-article
- https://segmentfault.com/a/1190000038251163

## 2、React事件绑定的方式有哪些？区别？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRwHHk6DfiaJ78aX4pHcs1xZZCnhGfjMWU3QVtxoO8XpB2Y9HdJbP6bZMCpETVTdPBibS6ficDeOowWg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

在`react`应用中，事件名都是用小驼峰格式进行书写，例如`onclick`要改写成`onClick`

最简单的事件绑定如下：

```
class ShowAlert extends React.Component {
  showAlert() {
    console.log("Hi");
  }

  render() {
    return <button onClick={this.showAlert}>show</button>;
  }
}
```

从上面可以看到，事件绑定的方法需要使用`{}`包住

上述的代码看似没有问题，但是当将处理函数输出代码换成`console.log(this)`的时候，点击按钮，则会发现控制台输出`undefined`

### 二、如何绑定

为了解决上面正确输出`this`的问题，常见的绑定方式有如下：

- render方法中使用bind
- render方法中使用箭头函数
- constructor中bind
- 定义阶段使用箭头函数绑定

#### render方法中使用bind

如果使用一个类组件，在其中给某个组件/元素一个`onClick`属性，它现在并会自定绑定其`this`到当前组件，解决这个问题的方法是在事件函数后使用`.bind(this)`将`this`绑定到当前组件中

```
class App extends React.Component {
  handleClick() {
    console.log('this > ', this);
  }
  render() {
    return (
      <div onClick={this.handleClick.bind(this)}>test</div>
    )
  }
}
```

这种方式在组件每次`render`渲染的时候，都会重新进行`bind`的操作，影响性能

#### render方法中使用箭头函数

通过`ES6`的上下文来将`this`的指向绑定给当前组件，同样在每一次`render`的时候都会生成新的方法，影响性能

```
class App extends React.Component {
  handleClick() {
    console.log('this > ', this);
  }
  render() {
    return (
      <div onClick={e => this.handleClick(e)}>test</div>
    )
  }
}
```

#### constructor中bind

在`constructor`中预先`bind`当前组件，可以避免在`render`操作中重复绑定

```
class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    console.log('this > ', this);
  }
  render() {
    return (
      <div onClick={this.handleClick}>test</div>
    )
  }
}
```

#### 定义阶段使用箭头函数绑定

跟上述方式三一样，能够避免在`render`操作中重复绑定，实现也非常的简单，如下：

```
class App extends React.Component {
  constructor(props) {
    super(props);
  }
  handleClick = () => {
    console.log('this > ', this);
  }
  render() {
    return (
      <div onClick={this.handleClick}>test</div>
    )
  }
}
```

### 三、区别

上述四种方法的方式，区别主要如下：

- 编写方面：方式一、方式二写法简单，方式三的编写过于冗杂
- 性能方面：方式一和方式二在每次组件render的时候都会生成新的方法实例，性能问题欠缺。若该函数作为属性值传给子组件的时候，都会导致额外的渲染。而方式三、方式四只会生成一个方法实例

综合上述，方式四是最优的事件绑定方式

### 参考文献

- https://segmentfault.com/a/1190000011317515
- https://vue3js.cn/interview/

## 3、React构建组件的方式有哪些？区别？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSVlnjlXOv7M6SiaOV3tm39xtjO1Jme5ThApvDhAS6QnLSWweukmezChKtibfOeB4M23bFFHCJ0PP0g/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

组件就是把图形、非图形的各种逻辑均抽象为一个统一的概念（组件）来实现开发的模式

在`React`中，一个类、一个函数都可以视为一个组件

在[Vue系列](https://mp.weixin.qq.com/s?__biz=MzU1OTgxNDQ1Nw==&mid=2247484292&idx=1&sn=76ff2903942ce748b58e9339997b7969&scene=21#wechat_redirect)中，我们了解到组件所存在的优势：

- 降低整个系统的耦合度，在保持接口不变的情况下，我们可以替换不同的组件快速完成需求，例如输入框，可以替换为日历、时间、范围等组件作具体的实现
- 调试方便，由于整个系统是通过组件组合起来的，在出现问题的时候，可以用排除法直接移除组件，或者根据报错的组件快速定位问题，之所以能够快速定位，是因为每个组件之间低耦合，职责单一，所以逻辑会比分析整个系统要简单
- 提高可维护性，由于每个组件的职责单一，并且组件在系统中是被复用的，所以对代码进行优化可获得系统的整体升级

### 二、如何构建

在`React`目前来讲，组件的创建主要分成了三种方式：

- 函数式创建
- 通过 React.createClass 方法创建
- 继承 React.Component 创建

#### 函数式创建

在`React Hooks`出来之前，函数式组件可以视为无状态组件，只负责根据传入的`props`来展示视图，不涉及对`state`状态的操作

大多数组件可以写为无状态组件，通过简单组合构建其他组件

在`React`中，通过函数简单创建组件的示例如下：

```
function HelloComponent(props, /* context */) {
  return <div>Hello {props.name}</div>
}
```

#### 通过 React.createClass 方法创建

`React.createClass`是react刚开始推荐的创建组件的方式，目前这种创建方式已经不怎么用了

像上述通过函数式创建的组件的方式，最终会通过`babel`转化成`React.createClass`这种形式，转化成如下：

```
function HelloComponent(props) /* context */{
  return React.createElement(
    "div",
    null,
    "Hello ",
    props.name
  );
}
```

由于上述的编写方式过于冗杂，目前基本上不使用上

#### 继承 React.Component 创建

同样在`react hooks`出来之前，有状态的组件只能通过继承`React.Component`这种形式进行创建

有状态的组件也就是组件内部存在维护的数据，在类创建的方式中通过`this.state`进行访问

当调用`this.setState`修改组件的状态时，组件会再次会调用`render()`方法进行重新渲染

通过继承`React.Component`创建一个时钟示例如下：

```
class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { seconds: 0 };
  }

  tick() {
    this.setState(state => ({
      seconds: state.seconds + 1
    }));
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <div>
        Seconds: {this.state.seconds}
      </div>
    );
  }
}
```

### 三、区别

由于`React.createClass`创建的方式过于冗杂，并不建议使用

而像函数式创建和类组件创建的区别主要在于需要创建的组件是否需要为有状态组件：

- 对于一些无状态的组件创建，建议使用函数式创建的方式
- 由于`react hooks`的出现，函数式组件创建的组件通过使用`hooks`方法也能使之成为有状态组件，再加上目前推崇函数式编程，所以这里建议都使用函数式的方式来创建组件

在考虑组件的选择原则上，能用无状态组件则用无状态组件

### 参考文献

- https://react.docschina.org/

## 4、React中组件之间通信的方式有哪些？


![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibR5Y4qv2Dias0R7Mq5mEKNVWn0mVUlcP1xG4r2SAp1cuFia8ZG2F8fOfyJibct1XIcxopR7icJxibXRYKA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

我们将组件间通信可以拆分为两个词：

- 组件
- 通信

回顾[Vue系列](https://mp.weixin.qq.com/s?__biz=MzU1OTgxNDQ1Nw==&mid=2247484224&idx=1&sn=3043891f60d99afcf74dffd6b9b51ff7&scene=21#wechat_redirect)的文章，组件是`vue`中最强大的功能之一，同样组件化是`React`的核心思想

相比`vue`，`React`的组件更加灵活和多样，按照不同的方式可以分成很多类型的组件

而通信指的是发送者通过某种媒体以某种格式来传递信息到收信者以达到某个目的，广义上，任何信息的交通都是通信

组件间通信即指组件通过某种方式来传递信息以达到某个目的

### 二、如何通信

组件传递的方式有很多种，根据传送者和接收者可以分为如下：

- 父组件向子组件传递
- 子组件向父组件传递
- 兄弟组件之间的通信
- 父组件向后代组件传递
- 非关系组件传递

#### 父组件向子组件传递

由于`React`的数据流动为单向的，父组件向子组件传递是最常见的方式

父组件在调用子组件的时候，只需要在子组件标签内传递参数，子组件通过`props`属性就能接收父组件传递过来的参数

```
function EmailInput(props) {
  return (
    <label>
      Email: <input value={props.email} />
    </label>
  );
}

const element = <EmailInput email="123124132@163.com" />;
```

#### 子组件向父组件传递

子组件向父组件通信的基本思路是，父组件向子组件传一个函数，然后通过这个函数的回调，拿到子组件传过来的值

父组件对应代码如下：

```
class Parents extends Component {
  constructor() {
    super();
    this.state = {
      price: 0
    };
  }

  getItemPrice(e) {
    this.setState({
      price: e
    });
  }

  render() {
    return (
      <div>
        <div>price: {this.state.price}</div>
        {/* 向子组件中传入一个函数  */}
        <Child getPrice={this.getItemPrice.bind(this)} />
      </div>
    );
  }
}
```

子组件对应代码如下：

```
class Child extends Component {
  clickGoods(e) {
    // 在此函数中传入值
    this.props.getPrice(e);
  }

  render() {
    return (
      <div>
        <button onClick={this.clickGoods.bind(this, 100)}>goods1</button>
        <button onClick={this.clickGoods.bind(this, 1000)}>goods2</button>
      </div>
    );
  }
}
```

#### 兄弟组件之间的通信

如果是兄弟组件之间的传递，则父组件作为中间层来实现数据的互通，通过使用父组件传递

```
class Parent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {count: 0}
  }
  setCount = () => {
    this.setState({count: this.state.count + 1})
  }
  render() {
    return (
      <div>
        <SiblingA
          count={this.state.count}
        />
        <SiblingB
          onClick={this.setCount}
        />
      </div>
    );
  }
}
```

#### 父组件向后代组件传递

父组件向后代组件传递数据是一件最普通的事情，就像全局数据一样

使用`context`提供了组件之间通讯的一种方式，可以共享数据，其他数据都能读取对应的数据

通过使用`React.createContext`创建一个`context`

```
 const PriceContext = React.createContext('price')
```

`context`创建成功后，其下存在`Provider`组件用于创建数据源，`Consumer`组件用于接收数据，使用实例如下：

`Provider`组件通过`value`属性用于给后代组件传递数据：

```
<PriceContext.Provider value={100}>
</PriceContext.Provider>
```

如果想要获取`Provider`传递的数据，可以通过`Consumer`组件或者或者使用`contextType`属性接收，对应分别如下：

```
class MyClass extends React.Component {
  static contextType = PriceContext;
  render() {
    let price = this.context;
    /* 基于这个值进行渲染工作 */
  }
}
```

`Consumer`组件：

```
<PriceContext.Consumer>
    { /*这里是一个函数*/ }
    {
        price => <div>price：{price}</div>
    }
</PriceContext.Consumer>
```

#### 非关系组件传递

如果组件之间关系类型比较复杂的情况，建议将数据进行一个全局资源管理，从而实现通信，例如`redux`。关于`redux`的使用后续再详细介绍

### 三、总结

由于`React`是单向数据流，主要思想是组件不会改变接收的数据，只会监听数据的变化，当数据发生变化时它们会使用接收到的新值，而不是去修改已有的值

因此，可以看到通信过程中，数据的存储位置都是存放在上级位置中

### 参考文献

- https://react.docschina.org/docs/context.html

## 5、React中的key有什么作用？



## 6、diff算法

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQshPro8TrQ8r9WNDc8D3lqOO8iaFwQNHmkqdphC1oeR3upEwzRnGKnQpRlzjibLFVicwibIdibOZRibPibg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

`diff` 算法是一种通过同层的树节点进行比较的高效算法

其有两个特点：

- 比较只会在同层级进行, 不会跨层级比较
- 在diff比较的过程中，循环从两边向中间比较

`diff` 算法的在很多场景下都有应用，在 `vue` 中，作用于虚拟 `dom` 渲染成真实 `dom` 的新旧 `VNode` 节点比较

### 二、比较方式

`diff`整体策略为：深度优先，同层比较

1. 比较只会在同层级进行, 不会跨层级比较

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQshPro8TrQ8r9WNDc8D3lqkTDKOcwvEYYiaAysfebZyUmVGTsxrlLQDMTjSiaQV2TBQTVKeoOP2zRA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

1. 比较的过程中，循环从两边向中间收拢

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQshPro8TrQ8r9WNDc8D3lqUoa9icYgzFKd4pFWbTa7Q5VMbAI5JYxqRAaZIRxzBVJTWrzCq4VBg4g/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

下面举个`vue`通过`diff`算法更新的例子：

新旧`VNode`节点如下图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQshPro8TrQ8r9WNDc8D3lqxq130nY4owMPnTUSiavmceSZtlYcl4MhcSRMQcwhl6ibbJ063KS064lw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

第一次循环后，发现旧节点D与新节点D相同，直接复用旧节点D作为`diff`后的第一个真实节点，同时旧节点`endIndex`移动到C，新节点的 `startIndex` 移动到了 C

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQshPro8TrQ8r9WNDc8D3lqiaV4ibxnSqzNe5fQBHibJlUPvaXB3BicXo6XEtgBuUqia6nRpuE0lgEoAFg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

第二次循环后，同样是旧节点的末尾和新节点的开头(都是 C)相同，同理，`diff` 后创建了 C 的真实节点插入到第一次创建的 B 节点后面。同时旧节点的 `endIndex` 移动到了 B，新节点的 `startIndex` 移动到了 E

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQshPro8TrQ8r9WNDc8D3lqZEib8qx68OFZzepRtLPRBKhvR7DMsiajBz2yc7J7fz0CV9KVFV2p0ZRw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

第三次循环中，发现E没有找到，这时候只能直接创建新的真实节点 E，插入到第二次创建的 C 节点之后。同时新节点的 `startIndex` 移动到了 A。旧节点的 `startIndex` 和 `endIndex` 都保持不动

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQshPro8TrQ8r9WNDc8D3lqrQDHia7WnGxQ1IvVClty5NJV52Qs5W3lKRqoODYsxZSdCYddpdmFvNg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

第四次循环中，发现了新旧节点的开头(都是 A)相同，于是 `diff` 后创建了 A 的真实节点，插入到前一次创建的 E 节点后面。同时旧节点的 `startIndex` 移动到了 B，新节点的`startIndex` 移动到了 B

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQshPro8TrQ8r9WNDc8D3lqzm6ljpxjgyyUd7Xf5PhhRDP0U1VSS9kI0SNibYicibemsZiaTb8eTmVwkA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

第五次循环中，情形同第四次循环一样，因此 `diff` 后创建了 B 真实节点 插入到前一次创建的 A 节点后面。同时旧节点的 `startIndex`移动到了 C，新节点的 startIndex 移动到了 F

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQshPro8TrQ8r9WNDc8D3lqmymQQicRFAjR6pkicIeQJ6NmmFdpNMBAd6f8F0qmKltTdZoSickHc33aQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

新节点的 `startIndex` 已经大于 `endIndex` 了，需要创建 `newStartIdx` 和 `newEndIdx` 之间的所有节点，也就是节点F，直接创建 F 节点对应的真实节点放到 B 节点后面

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQshPro8TrQ8r9WNDc8D3lqVDocxLCWSn7T0A1erGbicRzdTecNDpWBNnQOKyOCoianxibyPAj1UMYZg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 三、原理分析

当数据发生改变时，`set`方法会调用`Dep.notify`通知所有订阅者`Watcher`，订阅者就会调用`patch`给真实的`DOM`打补丁，更新相应的视图

源码位置：src/core/vdom/patch.js

```
function patch(oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) { // 没有新节点，直接执行destory钩子函数
        if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
        return
    }

    let isInitialPatch = false
    const insertedVnodeQueue = []

    if (isUndef(oldVnode)) {
        isInitialPatch = true
        createElm(vnode, insertedVnodeQueue) // 没有旧节点，直接用新节点生成dom元素
    } else {
        const isRealElement = isDef(oldVnode.nodeType)
        if (!isRealElement && sameVnode(oldVnode, vnode)) {
            // 判断旧节点和新节点自身一样，一致执行patchVnode
            patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
        } else {
            // 否则直接销毁及旧节点，根据新节点生成dom元素
            if (isRealElement) {

                if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                    oldVnode.removeAttribute(SSR_ATTR)
                    hydrating = true
                }
                if (isTrue(hydrating)) {
                    if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                        invokeInsertHook(vnode, insertedVnodeQueue, true)
                        return oldVnode
                    }
                }
                oldVnode = emptyNodeAt(oldVnode)
            }
            return vnode.elm
        }
    }
}
```

`patch`函数前两个参数位为`oldVnode` 和 `Vnode` ，分别代表新的节点和之前的旧节点，主要做了四个判断：

- 没有新节点，直接触发旧节点的`destory`钩子
- 没有旧节点，说明是页面刚开始初始化的时候，此时，根本不需要比较了，直接全是新建，所以只调用 `createElm`
- 旧节点和新节点自身一样，通过 `sameVnode` 判断节点是否一样，一样时，直接调用 `patchVnode`去处理这两个节点
- 旧节点和新节点自身不一样，当两个节点不一样的时候，直接创建新节点，删除旧节点

下面主要讲的是`patchVnode`部分

```
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    // 如果新旧节点一致，什么都不做
    if (oldVnode === vnode) {
      return
    }

    // 让vnode.el引用到现在的真实dom，当el修改时，vnode.el会同步变化
    const elm = vnode.elm = oldVnode.elm

    // 异步占位符
    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
      } else {
        vnode.isAsyncPlaceholder = true
      }
      return
    }
    // 如果新旧都是静态节点，并且具有相同的key
    // 当vnode是克隆节点或是v-once指令控制的节点时，只需要把oldVnode.elm和oldVnode.child都复制到vnode上
    // 也不用再有其他操作
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      vnode.componentInstance = oldVnode.componentInstance
      return
    }

    let i
    const data = vnode.data
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode)
    }

    const oldCh = oldVnode.children
    const ch = vnode.children
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }
    // 如果vnode不是文本节点或者注释节点
    if (isUndef(vnode.text)) {
      // 并且都有子节点
      if (isDef(oldCh) && isDef(ch)) {
        // 并且子节点不完全一致，则调用updateChildren
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)

        // 如果只有新的vnode有子节点
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        // elm已经引用了老的dom节点，在老的dom节点上添加子节点
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)

        // 如果新vnode没有子节点，而vnode有子节点，直接删除老的oldCh
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)

        // 如果老节点是文本节点
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '')
      }

      // 如果新vnode和老vnode是文本节点或注释节点
      // 但是vnode.text != oldVnode.text时，只需要更新vnode.elm的文本内容就可以
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text)
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
    }
  }
```

`patchVnode`主要做了几个判断：

- 新节点是否是文本节点，如果是，则直接更新`dom`的文本内容为新节点的文本内容
- 新节点和旧节点如果都有子节点，则处理比较更新子节点
- 只有新节点有子节点，旧节点没有，那么不用比较了，所有节点都是全新的，所以直接全部新建就好了，新建是指创建出所有新`DOM`，并且添加进父节点
- 只有旧节点有子节点而新节点没有，说明更新后的页面，旧节点全部都不见了，那么要做的，就是把所有的旧节点删除，也就是直接把`DOM` 删除

子节点不完全一致，则调用`updateChildren`

```
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    let oldStartIdx = 0 // 旧头索引
    let newStartIdx = 0 // 新头索引
    let oldEndIdx = oldCh.length - 1 // 旧尾索引
    let newEndIdx = newCh.length - 1 // 新尾索引
    let oldStartVnode = oldCh[0] // oldVnode的第一个child
    let oldEndVnode = oldCh[oldEndIdx] // oldVnode的最后一个child
    let newStartVnode = newCh[0] // newVnode的第一个child
    let newEndVnode = newCh[newEndIdx] // newVnode的最后一个child
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    const canMove = !removeOnly

    // 如果oldStartVnode和oldEndVnode重合，并且新的也都重合了，证明diff完了，循环结束
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // 如果oldVnode的第一个child不存在
      if (isUndef(oldStartVnode)) {
        // oldStart索引右移
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left

      // 如果oldVnode的最后一个child不存在
      } else if (isUndef(oldEndVnode)) {
        // oldEnd索引左移
        oldEndVnode = oldCh[--oldEndIdx]

      // oldStartVnode和newStartVnode是同一个节点
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        // patch oldStartVnode和newStartVnode， 索引左移，继续循环
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]

      // oldEndVnode和newEndVnode是同一个节点
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        // patch oldEndVnode和newEndVnode，索引右移，继续循环
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]

      // oldStartVnode和newEndVnode是同一个节点
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        // patch oldStartVnode和newEndVnode
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
        // 如果removeOnly是false，则将oldStartVnode.eml移动到oldEndVnode.elm之后
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        // oldStart索引右移，newEnd索引左移
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]

      // 如果oldEndVnode和newStartVnode是同一个节点
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        // patch oldEndVnode和newStartVnode
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        // 如果removeOnly是false，则将oldEndVnode.elm移动到oldStartVnode.elm之前
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        // oldEnd索引左移，newStart索引右移
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]

      // 如果都不匹配
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)

        // 尝试在oldChildren中寻找和newStartVnode的具有相同的key的Vnode
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)

        // 如果未找到，说明newStartVnode是一个新的节点
        if (isUndef(idxInOld)) { // New element
          // 创建一个新Vnode
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)

        // 如果找到了和newStartVnodej具有相同的key的Vnode，叫vnodeToMove
        } else {
          vnodeToMove = oldCh[idxInOld]
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !vnodeToMove) {
            warn(
              'It seems there are duplicate keys that is causing an update error. ' +
              'Make sure each v-for item has a unique key.'
            )
          }

          // 比较两个具有相同的key的新节点是否是同一个节点
          //不设key，newCh和oldCh只会进行头尾两端的相互比较，设key后，除了头尾两端的比较外，还会从用key生成的对象oldKeyToIdx中查找匹配的节点，所以为节点设置key可以更高效的利用dom。
          if (sameVnode(vnodeToMove, newStartVnode)) {
            // patch vnodeToMove和newStartVnode
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue)
            // 清除
            oldCh[idxInOld] = undefined
            // 如果removeOnly是false，则将找到的和newStartVnodej具有相同的key的Vnode，叫vnodeToMove.elm
            // 移动到oldStartVnode.elm之前
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)

          // 如果key相同，但是节点不相同，则创建一个新的节点
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)
          }
        }

        // 右移
        newStartVnode = newCh[++newStartIdx]
      }
    }
```

`while`循环主要处理了以下五种情景：

- 当新老 `VNode` 节点的 `start` 相同时，直接 `patchVnode` ，同时新老 `VNode` 节点的开始索引都加 1

- 当新老 `VNode` 节点的 `end`相同时，同样直接 `patchVnode` ，同时新老 `VNode` 节点的结束索引都减 1

- 当老 `VNode` 节点的 `start` 和新 `VNode` 节点的 `end` 相同时，这时候在 `patchVnode` 后，还需要将当前真实 `dom` 节点移动到 `oldEndVnode` 的后面，同时老 `VNode` 节点开始索引加 1，新 `VNode` 节点的结束索引减 1

- 当老 `VNode` 节点的 `end` 和新 `VNode` 节点的 `start` 相同时，这时候在 `patchVnode` 后，还需要将当前真实 `dom` 节点移动到 `oldStartVnode` 的前面，同时老 `VNode` 节点结束索引减 1，新 `VNode` 节点的开始索引加 1

- 如果都不满足以上四种情形，那说明没有相同的节点可以复用，则会分为以下两种情况：

- - 从旧的 `VNode` 为 `key` 值，对应 `index` 序列为 `value` 值的哈希表中找到与 `newStartVnode` 一致 `key` 的旧的 `VNode` 节点，再进行`patchVnode`，同时将这个真实 `dom`移动到 `oldStartVnode` 对应的真实 `dom` 的前面
  - 调用 `createElm` 创建一个新的 `dom` 节点放到当前 `newStartIdx` 的位置

### 小结

- 当数据发生改变时，订阅者`watcher`就会调用`patch`给真实的`DOM`打补丁

- 通过`isSameVnode`进行判断，相同则调用`patchVnode`方法

- `patchVnode`做了以下操作：

- - 找到对应的真实`dom`，称为`el`
  - 如果都有都有文本节点且不相等，将`el`文本节点设置为`Vnode`的文本节点
  - 如果`oldVnode`有子节点而`VNode`没有，则删除`el`子节点
  - 如果`oldVnode`没有子节点而`VNode`有，则将`VNode`的子节点真实化后添加到`el`
  - 如果两者都有子节点，则执行`updateChildren`函数比较子节点

- `updateChildren`主要做了以下操作：

- - 设置新旧`VNode`的头尾指针
  - 新旧头尾指针进行比较，循环向中间靠拢，根据情况调用`patchVnode`进行`patch`重复流程、调用`createElem`创建一个新节点，从哈希表寻找 `key`一致的`VNode` 节点再分情况操作

### 参考文献

- https://juejin.cn/post/6881907432541552648#heading-1
- https://www.infoq.cn/article/udlcpkh4iqb0cr5wgy7f

## 7、什么是虚拟DOM？如何实现一个虚拟DOM？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQwLUpw2ZXnTtxFdNPpseicQZLt9beKjcdefpd3b3VFlNooe5z45l9nHS9DbHoyHHVMSF0JicDEYaWw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、什么是虚拟DOM

虚拟 DOM （`Virtual DOM` ）这个概念相信大家都不陌生，从 `React` 到 `Vue` ，虚拟 `DOM` 为这两个框架都带来了跨平台的能力（`React-Native` 和 `Weex`）

实际上它只是一层对真实`DOM`的抽象，以`JavaScript` 对象 (`VNode` 节点) 作为基础的树，用对象的属性来描述节点，最终可以通过一系列操作使这棵树映射到真实环境上

在`Javascript`对象中，虚拟`DOM` 表现为一个 `Object`对象。并且最少包含标签名 (`tag`)、属性 (`attrs`) 和子元素对象 (`children`) 三个属性，不同框架对这三个属性的名命可能会有差别

创建虚拟`DOM`就是为了更好将虚拟的节点渲染到页面视图中，所以虚拟`DOM`对象的节点与真实`DOM`的属性一一照应

在`vue`中同样使用到了虚拟`DOM`技术

定义真实`DOM`

```
<div id="app">
    <p class="p">节点内容</p>
    <h3>{{ foo }}</h3>
</div>
```

实例化`vue`

```
const app = new Vue({
    el:"#app",
    data:{
        foo:"foo"
    }
})
```

观察`render`的`render`，我们能得到虚拟`DOM`

```
(function anonymous() {
 with(this){return _c('div',{attrs:{"id":"app"}},[_c('p',{staticClass:"p"},
       [_v("节点内容")]),_v(" "),_c('h3',[_v(_s(foo))])])}})
```

通过`VNode`，`vue`可以对这颗抽象树进行创建节点,删除节点以及修改节点的操作， 经过`diff`算法得出一些需要修改的最小单位,再更新视图，减少了`dom`操作，提高了性能

### 二、为什么需要虚拟DOM

`DOM`是很慢的，其元素非常庞大，页面的性能问题，大部分都是由`DOM`操作引起的

真实的`DOM`节点，哪怕一个最简单的`div`也包含着很多属性，可以打印出来直观感受一下：![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQwLUpw2ZXnTtxFdNPpseicQGBDtbnpvqtSrwuYib1IRvP861EfMuhToJC44gCdEOcDXnicpWVqQAhLw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

由此可见，操作`DOM`的代价仍旧是昂贵的，频繁操作还是会出现页面卡顿，影响用户的体验

**举个例子：**

你用传统的原生`api`或`jQuery`去操作`DOM`时，浏览器会从构建`DOM`树开始从头到尾执行一遍流程

当你在一次操作时，需要更新10个`DOM`节点，浏览器没这么智能，收到第一个更新`DOM`请求后，并不知道后续还有9次更新操作，因此会马上执行流程，最终执行10次流程

而通过`VNode`，同样更新10个`DOM`节点，虚拟`DOM`不会立即操作`DOM`，而是将这10次更新的`diff`内容保存到本地的一个`js`对象中，最终将这个`js`对象一次性`attach`到`DOM`树上，避免大量的无谓计算

> 很多人认为虚拟 DOM 最大的优势是 diff 算法，减少 JavaScript 操作真实 DOM 的带来的性能消耗。虽然这一个虚拟 DOM 带来的一个优势，但并不是全部。虚拟 DOM 最大的优势在于抽象了原本的渲染过程，实现了跨平台的能力，而不仅仅局限于浏览器的 DOM，可以是安卓和 IOS 的原生组件，可以是近期很火热的小程序，也可以是各种GUI

### 三、如何实现虚拟DOM

首先可以看看`vue`中`VNode`的结构

源码位置：src/core/vdom/vnode.js

```
export default class VNode {
  tag: string | void;
  data: VNodeData | void;
  children: ?Array<VNode>;
  text: string | void;
  elm: Node | void;
  ns: string | void;
  context: Component | void; // rendered in this component's scope
  functionalContext: Component | void; // only for functional component root nodes
  key: string | number | void;
  componentOptions: VNodeComponentOptions | void;
  componentInstance: Component | void; // component instance
  parent: VNode | void; // component placeholder node
  raw: boolean; // contains raw HTML? (server only)
  isStatic: boolean; // hoisted static node
  isRootInsert: boolean; // necessary for enter transition check
  isComment: boolean; // empty comment placeholder?
  isCloned: boolean; // is a cloned node?
  isOnce: boolean; // is a v-once node?

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions
  ) {
    /*当前节点的标签名*/
    this.tag = tag
    /*当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息*/
    this.data = data
    /*当前节点的子节点，是一个数组*/
    this.children = children
    /*当前节点的文本*/
    this.text = text
    /*当前虚拟节点对应的真实dom节点*/
    this.elm = elm
    /*当前节点的名字空间*/
    this.ns = undefined
    /*编译作用域*/
    this.context = context
    /*函数化组件作用域*/
    this.functionalContext = undefined
    /*节点的key属性，被当作节点的标志，用以优化*/
    this.key = data && data.key
    /*组件的option选项*/
    this.componentOptions = componentOptions
    /*当前节点对应的组件的实例*/
    this.componentInstance = undefined
    /*当前节点的父节点*/
    this.parent = undefined
    /*简而言之就是是否为原生HTML或只是普通文本，innerHTML的时候为true，textContent的时候为false*/
    this.raw = false
    /*静态节点标志*/
    this.isStatic = false
    /*是否作为跟节点插入*/
    this.isRootInsert = true
    /*是否为注释节点*/
    this.isComment = false
    /*是否为克隆节点*/
    this.isCloned = false
    /*是否有v-once指令*/
    this.isOnce = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next https://github.com/answershuto/learnVue*/
  get child (): Component | void {
    return this.componentInstance
  }
}
```

这里对`VNode`进行稍微的说明：

- 所有对象的 `context` 选项都指向了 `Vue` 实例
- `elm` 属性则指向了其相对应的真实 `DOM` 节点

```
vue`是通过`createElement`生成`VNode
```

源码位置：src/core/vdom/create-element.js

```
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}
```

上面可以看到`createElement` 方法实际上是对 `_createElement` 方法的封装，对参数的传入进行了判断

```
export function _createElement(
    context: Component,
    tag?: string | Class<Component> | Function | Object,
    data?: VNodeData,
    children?: any,
    normalizationType?: number
): VNode | Array<VNode> {
    if (isDef(data) && isDef((data: any).__ob__)) {
        process.env.NODE_ENV !== 'production' && warn(
            `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
            'Always create fresh vnode data objects in each render!',
            context`
        )
        return createEmptyVNode()
    }
    // object syntax in v-bind
    if (isDef(data) && isDef(data.is)) {
        tag = data.is
    }
    if (!tag) {
        // in case of component :is set to falsy value
        return createEmptyVNode()
    }
    ... 
    // support single function children as default scoped slot
    if (Array.isArray(children) &&
        typeof children[0] === 'function'
    ) {
        data = data || {}
        data.scopedSlots = { default: children[0] }
        children.length = 0
    }
    if (normalizationType === ALWAYS_NORMALIZE) {
        children = normalizeChildren(children)
    } else if ( === SIMPLE_NORMALIZE) {
        children = simpleNormalizeChildren(children)
    }
 // 创建VNode
    ...
}
```

可以看到`_createElement`接收5个参数：

- `context` 表示 `VNode` 的上下文环境，是 `Component` 类型
- tag 表示标签，它可以是一个字符串，也可以是一个 `Component`
- `data` 表示 `VNode` 的数据，它是一个 `VNodeData` 类型
- `children` 表示当前 `VNode`的子节点，它是任意类型的
- `normalizationType` 表示子节点规范的类型，类型不同规范的方法也就不一样，主要是参考 `render` 函数是编译生成的还是用户手写的

根据`normalizationType` 的类型，`children`会有不同的定义

```
if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
} else if ( === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
}
```

`simpleNormalizeChildren`方法调用场景是 `render` 函数是编译生成的

`normalizeChildren`方法调用场景分为下面两种：

- `render` 函数是用户手写的
- 编译 `slot`、`v-for` 的时候会产生嵌套数组

无论是`simpleNormalizeChildren`还是`normalizeChildren`都是对`children`进行规范（使`children` 变成了一个类型为 `VNode` 的 `Array`），这里就不展开说了

规范化`children`的源码位置在：src/core/vdom/helpers/normalzie-children.js

在规范化`children`后，就去创建`VNode`

```
let vnode, ns
// 对tag进行判断
if (typeof tag === 'string') {
  let Ctor
  ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
  if (config.isReservedTag(tag)) {
    // 如果是内置的节点，则直接创建一个普通VNode
    vnode = new VNode(
      config.parsePlatformTagName(tag), data, children,
      undefined, undefined, context
    )
  } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
    // component
    // 如果是component类型，则会通过createComponent创建VNode节点
    vnode = createComponent(Ctor, data, context, children, tag)
  } else {
    vnode = new VNode(
      tag, data, children,
      undefined, undefined, context
    )
  }
} else {
  // direct component options / constructor
  vnode = createComponent(tag, data, context, children)
}
createComponent`同样是创建`VNode
```

源码位置：src/core/vdom/create-component.js

```
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  if (isUndef(Ctor)) {
    return
  }
 // 构建子类构造函数 
  const baseCtor = context.$options._base

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  if (typeof Ctor !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      warn(`Invalid Component definition: ${String(Ctor)}`, context)
    }
    return
  }

  // async component
  let asyncFactory
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context)
    if (Ctor === undefined) {
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }

  data = data || {}

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor)

  // transform component v-model data into props & events
  if (isDef(data.model)) {
    transformModel(Ctor.options, data)
  }

  // extract props
  const propsData = extractPropsFromVNodeData(data, Ctor, tag)

  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  const listeners = data.on
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn

  if (isTrue(Ctor.options.abstract)) {
    const slot = data.slot
    data = {}
    if (slot) {
      data.slot = slot
    }
  }

  // 安装组件钩子函数，把钩子函数合并到data.hook中
  installComponentHooks(data)

  //实例化一个VNode返回。组件的VNode是没有children的
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )
  if (__WEEX__ && isRecyclableComponent(vnode)) {
    return renderRecyclableComponentTemplate(vnode)
  }

  return vnode
}
```

稍微提下`createComponent`生成`VNode`的三个关键流程：

- 构造子类构造函数`Ctor`
- `installComponentHooks`安装组件钩子函数
- 实例化 `vnode`

### 小结

`createElement` 创建 `VNode` 的过程，每个 `VNode` 有 `children`，`children` 每个元素也是一个`VNode`，这样就形成了一个虚拟树结构，用于描述真实的`DOM`树结构

### 参考文献

- https://ustbhuangyi.github.io/vue-analysis/v2/data-driven/create-element.html#children-%E7%9A%84%E8%A7%84%E8%8C%83%E5%8C%96
- https://juejin.cn/post/6876711874050818061

## 8、说说对React中类组件和函数组件的理解？有什么区别？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibReZL6RgAEPttf6e6AKWrNcQQia05ZTVbRJwS5uHZkcO1yDU85mPYMerQAmnN4xN5K4sDTAb2hCHrQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、类组件 

类组件，顾名思义，也就是通过使用`ES6`类的编写形式去编写组件，该类必须继承`React.Component`

如果想要访问父组件传递过来的参数，可通过`this.props`的方式去访问

在组件中必须实现`render`方法，在`return`中返回`React`对象，如下：

```
class Welcome extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return <h1>Hello, {this.props.name}</h1>
  }
}
```

### 二、函数组件

函数组件，顾名思义，就是通过函数编写的形式去实现一个`React`组件，是`React`中定义组件最简单的方式

```
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

函数第一个参数为`props`用于接收父组件传递过来的参数

### 三、区别

针对两种`React`组件，其区别主要分成以下几大方向：

- 编写形式
- 状态管理
- 生命周期
- 调用方式
- 获取渲染的值

#### 编写形式

两者最明显的区别在于编写形式的不同，同一种功能的实现可以分别对应类组件和函数组件的编写形式

函数组件：

```
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

类组件：

```
class Welcome extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return <h1>Hello, {this.props.name}</h1>
  }
}
```

#### 状态管理

在`hooks`出来之前，函数组件就是无状态组件，不能保管组件的状态，不像类组件中调用`setState`

如果想要管理`state`状态，可以使用`useState`，如下：

```
const FunctionalComponent = () => {
    const [count, setCount] = React.useState(0);

    return (
        <div>
            <p>count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Click</button>
        </div>
    );
};
```

在使用`hooks`情况下，一般如果函数组件调用`state`，则需要创建一个类组件或者`state`提升到你的父组件中，然后通过`props`对象传递到子组件

#### 生命周期

在函数组件中，并不存在生命周期，这是因为这些生命周期钩子都来自于继承的`React.Component`

所以，如果用到生命周期，就只能使用类组件

但是函数组件使用`useEffect`也能够完成替代生命周期的作用，这里给出一个简单的例子：

```
const FunctionalComponent = () => {
    useEffect(() => {
        console.log("Hello");
    }, []);
    return <h1>Hello, World</h1>;
};
```

上述简单的例子对应类组件中的`componentDidMount`生命周期

如果在`useEffect`回调函数中`return`一个函数，则`return`函数会在组件卸载的时候执行，正如`componentWillUnmount`

```
const FunctionalComponent = () => {
 React.useEffect(() => {
   return () => {
     console.log("Bye");
   };
 }, []);
 return <h1>Bye, World</h1>;
};
```

#### 调用方式

如果是一个函数组件，调用则是执行函数即可：

```
// 你的代码 
function SayHi() { 
    return <p>Hello, React</p> 
} 
// React内部 
const result = SayHi(props) // » <p>Hello, React</p>
```

如果是一个类组件，则需要将组件进行实例化，然后调用实例对象的`render`方法：

```
// 你的代码 
class SayHi extends React.Component { 
    render() { 
        return <p>Hello, React</p> 
    } 
} 
// React内部 
const instance = new SayHi(props) // » SayHi {} 
const result = instance.render() // » <p>Hello, React</p>
```

#### 获取渲染的值

首先给出一个示例

函数组件对应如下：

```
function ProfilePage(props) {
  const showMessage = () => {
    alert('Followed ' + props.user);
  }

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  }

  return (
    <button onClick={handleClick}>Follow</button>
  )
}
```

类组件对应如下：

```
class ProfilePage extends React.Component {
  showMessage() {
    alert('Followed ' + this.props.user);
  }

  handleClick() {
    setTimeout(this.showMessage.bind(this), 3000);
  }

  render() {
    return <button onClick={this.handleClick.bind(this)}>Follow</button>
  }
}
```

两者看起来实现功能是一致的，但是在类组件中，输出`this.props.user`，`Props`在 `React`中是不可变的所以它永远不会改变，但是 `this` 总是可变的，以便您可以在 `render` 和生命周期函数中读取新版本

因此，如果我们的组件在请求运行时更新。`this.props` 将会改变。`showMessage`方法从“最新”的 `props` 中读取 `user`

而函数组件，本身就不存在`this`，`props`并不发生改变，因此同样是点击，`alert`的内容仍旧是之前的内容

### 小结

两种组件都有各自的优缺点

函数组件语法更短、更简单，这使得它更容易开发、理解和测试

而类组件也会因大量使用 `this`而让人感到困惑

### 参考文献

- https://zh-hans.reactjs.org/docs/components-and-props.html#function-and-class-components
- https://juejin.cn/post/6844903806140973069

## 9、说说react中引入css的方式有哪几种？区别？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSvMwsN12YYU8evchItG64iaTDAq2n0t6HPfA7EqOiayDPJJIiboY02CNuqpZzr5ibjeHLma5mLcSpCVA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

组件式开发选择合适的`css`解决方案尤为重要

通常会遵循以下规则：

- 可以编写局部css，不会随意污染其他组件内的原生；
- 可以编写动态的css，可以获取当前组件的一些状态，根据状态的变化生成不同的css样式；
- 支持所有的css特性：伪类、动画、媒体查询等；
- 编写起来简洁方便、最好符合一贯的css风格特点

在这一方面，`vue`使用`css`起来更为简洁：

- 通过 style 标签编写样式
- scoped 属性决定编写的样式是否局部有效
- lang 属性设置预处理器
- 内联样式风格的方式来根据最新状态设置和改变css

而在`react`中，引入`CSS`就不如`Vue`方便简洁，其引入`css`的方式有很多种，各有利弊

### 二、方式

常见的`CSS`引入方式有以下：

- 在组件内直接使用
- 组件中引入 .css 文件
- 组件中引入 .module.css 文件
- CSS in JS

#### 在组件内直接使用

直接在组件中书写`css`样式，通过`style`属性直接引入，如下：

```
import React, { Component } from "react";

const div1 = {
  width: "300px",
  margin: "30px auto",
  backgroundColor: "#44014C",  //驼峰法
  minHeight: "200px",
  boxSizing: "border-box"
};

class Test extends Component {
  constructor(props, context) {
    super(props);
  }
 
  render() {
    return (
     <div>
       <div style={div1}>123</div>
       <div style={{backgroundColor:"red"}}>
     </div>
    );
  }
}

export default Test;
```

上面可以看到，`css`属性需要转换成驼峰写法

这种方式优点：

- 内联样式, 样式之间不会有冲突
- 可以动态获取当前state中的状态

缺点：

- 写法上都需要使用驼峰标识
- 某些样式没有提示
- 大量的样式, 代码混乱
- 某些样式无法编写(比如伪类/伪元素)

#### 组件中引入css文件

将`css`单独写在一个`css`文件中，然后在组件中直接引入

`App.css`文件：

```
.title {
  color: red;
  font-size: 20px;
}

.desc {
  color: green;
  text-decoration: underline;
}
```

组件中引入：

```
import React, { PureComponent } from 'react';

import Home from './Home';

import './App.css';

export default class App extends PureComponent {
  render() {
    return (
      <div className="app">
        <h2 className="title">我是App的标题</h2>
        <p className="desc">我是App中的一段文字描述</p>
        <Home/>
      </div>
    )
  }
}
```

这种方式存在不好的地方在于样式是全局生效，样式之间会互相影响

#### 组件中引入 .module.css 文件

将`css`文件作为一个模块引入，这个模块中的所有`css`，只作用于当前组件。不会影响当前组件的后代组件

这种方式是`webpack`特工的方案，只需要配置`webpack`配置文件中`modules:true`即可

```
import React, { PureComponent } from 'react';

import Home from './Home';

import './App.module.css';

export default class App extends PureComponent {
  render() {
    return (
      <div className="app">
        <h2 className="title">我是App的标题</h2>
        <p className="desc">我是App中的一段文字描述</p>
        <Home/>
      </div>
    )
  }
}
```

这种方式能够解决局部作用域问题，但也有一定的缺陷：

- 引用的类名，不能使用连接符(.xxx-xx)，在 JavaScript 中是不识别的
- 所有的 className 都必须使用 {style.className} 的形式来编写
- 不方便动态来修改某些样式，依然需要使用内联样式的方式；

#### CSS in JS

CSS-in-JS， 是指一种模式，其中`CSS`由 `JavaScript`生成而不是在外部文件中定义

此功能并不是 React 的一部分，而是由第三方库提供，例如：

- styled-components
- emotion
- glamorous

下面主要看看`styled-components`的基本使用

本质是通过函数的调用，最终创建出一个组件：

- 这个组件会被自动添加上一个不重复的class
- styled-components会给该class添加相关的样式

基本使用如下：

创建一个`style.js`文件用于存放样式组件：

```
export const SelfLink = styled.div`
  height: 50px;
  border: 1px solid red;
  color: yellow;
`;

export const SelfButton = styled.div`
  height: 150px;
  width: 150px;
  color: ${props => props.color};
  background-image: url(${props => props.src});
  background-size: 150px 150px;
`;
```

引入样式组件也很简单：

```
import React, { Component } from "react";

import { SelfLink, SelfButton } from "./style";

class Test extends Component {
  constructor(props, context) {
    super(props);
  }  
 
  render() {
    return (
     <div>
       <SelfLink title="People's Republic of China">app.js</SelfLink>
       <SelfButton color="palevioletred" style={{ color: "pink" }} src={fist}>
          SelfButton
        </SelfButton>
     </div>
    );
  }
}

export default Test;
```

### 三、区别

通过上面四种样式的引入，可以看到：

- 在组件内直接使用`css`该方式编写方便，容易能够根据状态修改样式属性，但是大量的演示编写容易导致代码混乱
- 组件中引入 .css 文件符合我们日常的编写习惯，但是作用域是全局的，样式之间会层叠
- 引入.module.css 文件能够解决局部作用域问题，但是不方便动态修改样式，需要使用内联的方式进行样式的编写
- 通过css in js 这种方法，可以满足大部分场景的应用，可以类似于预处理器一样样式嵌套、定义、修改状态等

至于使用`react`用哪种方案引入`css`，并没有一个绝对的答案，可以根据各自情况选择合适的方案

### 参考文献

- https://zh-hans.reactjs.org/docs/faq-styling.html#gatsby-focus-wrapper
- https://mp.weixin.qq.com/s/oywTpNKEikMXn8QTBgITow

## 10、说说你对Redux的理解？其工作原理？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTzkTGokAAxXicl0ryPc6K9RpQ9ibQ8SUiclVIEcdqIKoe4TJxyZt77lAicZLRZe0o3MD6WOce8KnkcGQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

`React`是用于构建用户界面的，帮助我们解决渲染`DOM`的过程

而在整个应用中会存在很多个组件，每个组件的`state`是由自身进行管理，包括组件定义自身的`state`、组件之间的通信通过`props`传递、使用`Context`实现数据共享

如果让每个组件都存储自身相关的状态，理论上来讲不会影响应用的运行，但在开发及后续维护阶段，我们将花费大量精力去查询状态的变化过程

这种情况下，如果将所有的状态进行集中管理，当需要更新状态的时候，仅需要对这个管理集中处理，而不用去关心状态是如何分发到每一个组件内部的

`redux`就是一个实现上述集中管理的容器，遵循三大基本原则：

- 单一数据源
- state 是只读的
- 使用纯函数来执行修改

注意的是，`redux`并不是只应用在`react`中，还与其他界面库一起使用，如`Vue`

### 二、工作原理

`redux`要求我们把数据都放在 `store`公共存储空间

一个组件改变了 `store` 里的数据内容，其他组件就能感知到 `store`的变化，再来取数据，从而间接的实现了这些数据传递的功能

工作流程图如下所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTzkTGokAAxXicl0ryPc6K9R8a2icC4xMoxt69UBpWWjmib6iaoicJIC2Qan7IKQTtqtXqZKIC5XmbGEDg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

根据流程图，可以想象，`React Components` 是借书的用户， `Action Creactor` 是借书时说的话(借什么书)， `Store` 是图书馆管理员，`Reducer` 是记录本(借什么书，还什么书，在哪儿，需要查一下)， `state` 是书籍信息

整个流程就是借书的用户需要先存在，然后需要借书，需要一句话来描述借什么书，图书馆管理员听到后需要查一下记录本，了解图书的位置，最后图书馆管理员会把这本书给到这个借书人

转换为代码是，`React Components` 需要获取一些数据, 然后它就告知 `Store` 需要获取数据，这就是就是 `Action Creactor` , `Store` 接收到之后去 `Reducer` 查一下， `Reducer` 会告诉 `Store` 应该给这个组件什么数据

### 三、如何使用

创建一个`store`的公共数据区域

```
import { createStore } from 'redux' // 引入一个第三方的方法
const store = createStore() // 创建数据的公共存储区域（管理员）
```

还需要创建一个记录本去辅助管理数据，也就是`reduecer`，本质就是一个函数，接收两个参数`state`，`action`，返回`state`

```
// 设置默认值
const initialState = {
  counter: 0
}

const reducer = (state = initialState, action) => {
}
```

然后就可以将记录本传递给`store`，两者建立连接。如下：

```
const store = createStore(reducer)
```

如果想要获取`store`里面的数据，则通过`store.getState()`来获取当前`state`

```
console.log(store.getState());
```

下面再看看如何更改`store`里面数据，是通过`dispatch`来派发`action`，通常`action`中都会有`type`属性，也可以携带其他的数据

```
store.dispatch({
  type: "INCREMENT"
})

store.dispath({
  type: "DECREMENT"
})

store.dispatch({
  type: "ADD_NUMBER",
  number: 5
})
```

下面再来看看修改`reducer`中的处理逻辑：

```
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "INCREMENT":
      return {...state, counter: state.counter + 1};
    case "DECREMENT":
      return {...state, counter: state.counter - 1};
    case "ADD_NUMBER":
      return {...state, counter: state.counter + action.number}
    default: 
      return state;
  }
}
```

注意，`reducer`是一个纯函数，不需要直接修改`state`

这样派发`action`之后，既可以通过`store.subscribe`监听`store`的变化，如下：

```
store.subscribe(() => {
  console.log(store.getState());
})
```

在`React`项目中，会搭配`react-redux`进行使用

完整代码如下：

```
const redux = require('redux');

const initialState = {
  counter: 0
}

// 创建reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "INCREMENT":
      return {...state, counter: state.counter + 1};
    case "DECREMENT":
      return {...state, counter: state.counter - 1};
    case "ADD_NUMBER":
      return {...state, counter: state.counter + action.number}
    default: 
      return state;
  }
}

// 根据reducer创建store
const store = redux.createStore(reducer);

store.subscribe(() => {
  console.log(store.getState());
})

// 修改store中的state
store.dispatch({
  type: "INCREMENT"
})
// console.log(store.getState());

store.dispatch({
  type: "DECREMENT"
})
// console.log(store.getState());

store.dispatch({
  type: "ADD_NUMBER",
  number: 5
})
// console.log(store.getState());
```

### 小结

- createStore可以帮助创建 store
- store.dispatch 帮助派发 action , action 会传递给 store
- store.getState 这个方法可以帮助获取 store 里边所有的数据内容
- store.subscrible 方法订阅 store 的改变，只要 store 发生改变， store.subscrible 这个函数接收的这个回调函数就会被执行

### 参考文献

- https://cn.redux.js.org/docs/introduction/
- https://www.redux.org.cn/docs/basics/Actions.html
- https://lulujianglab.com/posts/大白话解析 Redux 、 redux-thunk 、redux-saga 和 react-redux

## 11、说说对Redux中间件的理解？常用的中间件有哪些？实现原理？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQYGXgDw2QnnSMTibekVtGcCluV1NEOJDxFCgegte8x8Dq1A5mahfZmdyru29taHxVjbMfWmiceYtcw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

中间件（Middleware）在计算机中，是介于应用系统和系统软件之间的一类软件，它使用系统软件所提供的基础服务（功能），衔接网络上应用系统的各个部分或不同的应用，能够达到资源共享、功能共享的目的

在[这篇文章中](http://mp.weixin.qq.com/s?__biz=MzU1OTgxNDQ1Nw==&mid=2247488588&idx=2&sn=44a851337e9ba82201231decbb41782a&chksm=fc10d61acb675f0cc3b72c42222eda1c34c5a00e6e2a3834bcbba74adce16e9937700198fbc9&scene=21#wechat_redirect)，了解到了`Redux`整个工作流程，当`action`发出之后，`reducer`立即算出`state`，整个过程是一个同步的操作

那么如果需要支持异步操作，或者支持错误处理、日志监控，这个过程就可以用上中间件

`Redux`中，中间件就是放在就是在`dispatch`过程，在分发`action`进行拦截处理，如下图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQYGXgDw2QnnSMTibekVtGcCseCazvdFELNkc1R8NDaAoYXiaQyjdpaYMJ0k7zESUdjfP65vuC7RiaaA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

其本质上一个函数，对`store.dispatch`方法进行了改造，在发出 `Action`和执行 `Reducer`这两步之间，添加了其他功能

### 二、常用的中间件

有很多优秀的`redux`中间件，这里我们例举两个：

- redux-thunk：用于异步操作
- redux-logger：用于日志记录

上述的中间件都需要通过`applyMiddlewares`进行注册，作用是将所有的中间件组成一个数组，依次执行

然后作为第二个参数传入到`createStore`中

```
const store = createStore(
  reducer,
  applyMiddleware(thunk, logger)
);
```

#### redux-thunk

`redux-thunk`是官网推荐的异步处理中间件

默认情况下的`dispatch(action)`，`action`需要是一个`JavaScript`的对象

`redux-thunk`中间件会判断你当前传进来的数据类型，如果是一个函数，将会给函数传入参数值（dispatch，getState）

- dispatch函数用于我们之后再次派发action
- getState函数考虑到我们之后的一些操作需要依赖原来的状态，用于让我们可以获取之前的一些状态

所以`dispatch`可以写成下述函数的形式：

```
const getHomeMultidataAction = () => {
  return (dispatch) => {
    axios.get("http://xxx.xx.xx.xx/test").then(res => {
      const data = res.data.data;
      dispatch(changeBannersAction(data.banner.list));
      dispatch(changeRecommendsAction(data.recommend.list));
    })
  }
}
```

#### redux-logger

如果想要实现一个日志功能，则可以使用现成的`redux-logger`

```
import { applyMiddleware, createStore } from 'redux';
import createLogger from 'redux-logger';
const logger = createLogger();

const store = createStore(
  reducer,
  applyMiddleware(logger)
);
```

这样我们就能简单通过中间件函数实现日志记录的信息

### 三、实现原理

首先看看`applyMiddlewares`的源码

```
export default function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState, enhancer) => {
    var store = createStore(reducer, preloadedState, enhancer);
    var dispatch = store.dispatch;
    var chain = [];

    var middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    };
    chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);

    return {...store, dispatch}
  }
}
```

所有中间件被放进了一个数组`chain`，然后嵌套执行，最后执行`store.dispatch`。可以看到，中间件内部（`middlewareAPI`）可以拿到`getState`和`dispatch`这两个方法

在上面的学习中，我们了解到了`redux-thunk`的基本使用

内部会将`dispatch`进行一个判断，然后执行对应操作，原理如下：

```
function patchThunk(store) {
    let next = store.dispatch;

    function dispatchAndThunk(action) {
        if (typeof action === "function") {
            action(store.dispatch, store.getState);
        } else {
            next(action);
        }
    }

    store.dispatch = dispatchAndThunk;
}
```

实现一个日志输出的原理也非常简单，如下：

```
let next = store.dispatch;

function dispatchAndLog(action) {
  console.log("dispatching:", addAction(10));
  next(addAction(5));
  console.log("新的state:", store.getState());
}

store.dispatch = dispatchAndLog;
```

### 参考文献

- http://www.ruanyifeng.com/blog/2016/09/redux_tutorial_part_two_async_operations.html
- http://cn.redux.js.org/

## 12、你在React项目中是如何使用Redux的? 项目结构是如何划分的？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQwribVpXJzdw0DHK7Kk9vXY7UVLsMS4MITkK7ibmibxiahhh4dYMwJAKsjVxLQMtJvaXZUwyYPsc2LAA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、背景

在[Redux介绍中](http://mp.weixin.qq.com/s?__biz=MzU1OTgxNDQ1Nw==&mid=2247488588&idx=2&sn=44a851337e9ba82201231decbb41782a&chksm=fc10d61acb675f0cc3b72c42222eda1c34c5a00e6e2a3834bcbba74adce16e9937700198fbc9&scene=21#wechat_redirect)，我们了解到`redux`是用于数据状态管理，而`react`是一个视图层面的库

如果将两者连接在一起，可以使用官方推荐`react-redux`库，其具有高效且灵活的特性

`react-redux`将组件分成：

- 容器组件：存在逻辑处理
- UI 组件：只负责现显示和交互，内部不处理逻辑，状态由外部控制

通过`redux`将整个应用状态存储到`store`中，组件可以派发`dispatch`行为`action`给`store`

其他组件通过订阅`store`中的状态`state`来更新自身的视图

### 二、如何做

使用`react-redux`分成了两大核心：

- Provider
- connection

### Provider

在`redux`中存在一个`store`用于存储`state`，如果将这个`store`存放在顶层元素中，其他组件都被包裹在顶层元素之上

那么所有的组件都能够受到`redux`的控制，都能够获取到`redux`中的数据

使用方式如下：

```
<Provider store = {store}>
    <App />
<Provider>
```

### connection

```
connect`方法将`store`上的`getState`和 `dispatch`包装成组件的`props
```

导入`conect`如下：

```
import { connect } from "react-redux";
```

用法如下：

```
connect(mapStateToProps, mapDispatchToProps)(MyComponent)
```

可以传递两个参数：

- mapStateToProps
- mapDispatchToProps

### mapStateToProps

把`redux`中的数据映射到`react`中的`props`中去

如下：

```
const mapStateToProps = (state) => {
    return {
        // prop : state.xxx  | 意思是将state中的某个数据映射到props中
        foo: state.bar
    }
}
```

组件内部就能够通过`props`获取到`store`中的数据

```
class Foo extends Component {
    constructor(props){
        super(props);
    }
    render(){
        return(
        	// 这样子渲染的其实就是state.bar的数据了
            <div>this.props.foo</div>
        )
    }
}
Foo = connect()(Foo)
export default Foo
```

### mapDispatchToProps

将`redux`中的`dispatch`映射到组件内部的`props`中

```
const mapDispatchToProps = (dispatch) => { // 默认传递参数就是dispatch
  return {
    onClick: () => {
      dispatch({
        type: 'increatment'
      });
    }
  };
}
class Foo extends Component {
    constructor(props){
        super(props);
    }
    render(){
        return(
         
             <button onClick = {this.props.onClick}>点击increase</button>
        )
    }
}
Foo = connect()(Foo);
export default Foo;
```

### 小结

整体流程图大致如下所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQwribVpXJzdw0DHK7Kk9vXY1gkGicMYbkZ5BGJJMpfBcjBKzjDeoU5HjsIhyjYd6b7icvciaGMzk571w/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 三、项目结构

可以根据项目具体情况进行选择，以下列出两种常见的组织结构

#### 按角色组织（MVC）

角色如下：

- reducers
- actions
- components
- containers

参考如下：

```
reducers/
  todoReducer.js
  filterReducer.js
actions/
  todoAction.js
  filterActions.js
components/
  todoList.js
  todoItem.js
  filter.js
containers/
  todoListContainer.js
  todoItemContainer.js
  filterContainer.js
```

#### 按功能组织

使用`redux`使用功能组织项目，也就是把完成同一应用功能的代码放在一个目录下，一个应用功能包含多个角色的代码

`Redux`中，不同的角色就是`reducer`、`actions`和视图，而应用功能对应的就是用户界面的交互模块

参考如下：

```
todoList/
  actions.js
  actionTypes.js
  index.js
  reducer.js
  views/
    components.js
    containers.js
filter/
  actions.js
  actionTypes.js
  index.js
  reducer.js
  views/
    components.js
    container.js
```

每个功能模块对应一个目录，每个目录下包含同样的角色文件：

- actionTypes.js 定义action类型
- actions.js 定义action构造函数
- reducer.js  定义这个功能模块如果响应actions.js定义的动作
- views 包含功能模块中所有的React组件，包括展示组件和容器组件
- index.js 把所有的角色导入，统一导出

其中`index`模块用于导出对外的接口

```
import * as actions from './actions.js';
import reducer from './reducer.js';
import view from './views/container.js';

export { actions, reducer, view };
```

导入方法如下：

```
import { actions, reducer, view as TodoList } from './xxxx'
```

### 参考文献

- https://www.redux.org.cn/docs/basics/UsageWithReact.html
- https://segmentfault.com/a/1190000010384268

## 13、说说你对React Router的理解？常用的Router组件有哪些？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQbrWf2fg247OcJTicZcd4ibedEyPvQFJ2gh2DkIJOcNibvW4PKz474RsdfyLXzKkz8r5K4nJG1kL1eQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

`react-router`等前端路由的原理大致相同，可以实现无刷新的条件下切换显示不同的页面

路由的本质就是页面的`URL`发生改变时，页面的显示结果可以根据`URL`的变化而变化，但是页面不会刷新

因此，可以通过前端路由可以实现单页(SPA)应用

`react-router`主要分成了几个不同的包：

- react-router: 实现了路由的核心功能
- react-router-dom：基于 react-router，加入了在浏览器运行环境下的一些功能
- react-router-native：基于 react-router，加入了 react-native 运行环境下的一些功能
- react-router-config: 用于配置静态路由的工具库

### 二、有哪些

这里主要讲述的是`react-router-dom`的常用`API`，主要是提供了一些组件：

- BrowserRouter、HashRouter
- Route
- Link、NavLink
- switch
- redirect

#### BrowserRouter、HashRouter

`Router`中包含了对路径改变的监听，并且会将相应的路径传递给子组件

`BrowserRouter`是`history`模式，`HashRouter`模式

使用两者作为最顶层组件包裹其他组件

```
import { BrowserRouter as Router } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <main>
        <nav>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </nav>
      </main>
    </Router>
  );
}
```

### Route

`Route`用于路径的匹配，然后进行组件的渲染，对应的属性如下：

- path 属性：用于设置匹配到的路径
- component 属性：设置匹配到路径后，渲染的组件
- render 属性：设置匹配到路径后，渲染的内容
- exact 属性：开启精准匹配，只有精准匹配到完全一致的路径，才会渲染对应的组件

```
import { BrowserRouter as Router, Route } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <main>
        <nav>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </nav>
        <Route path="/" render={() => <h1>Welcome!</h1>} />
      </main>
    </Router>
  );
}
```

### Link、NavLink

通常路径的跳转是使用`Link`组件，最终会被渲染成`a`元素，其中属性`to`代替`a`标题的`href`属性

`NavLink`是在`Link`基础之上增加了一些样式属性，例如组件被选中时，发生样式变化，则可以设置`NavLink`的以下属性：

- activeStyle：活跃时（匹配时）的样式
- activeClassName：活跃时添加的class

如下：

```
<NavLink to="/" exact activeStyle={{color: "red"}}>首页</NavLink>
<NavLink to="/about" activeStyle={{color: "red"}}>关于</NavLink>
<NavLink to="/profile" activeStyle={{color: "red"}}>我的</NavLink>
```

如果需要实现`js`实现页面的跳转，那么可以通过下面的形式：

通过`Route`作为顶层组件包裹其他组件后,页面组件就可以接收到一些路由相关的东西，比如`props.history`

```
const Contact = ({ history }) => (
  <Fragment>
    <h1>Contact</h1>
    <button onClick={() => history.push("/")}>Go to home</button>
    <FakeText />
  </Fragment>
);
props`中接收到的`history`对象具有一些方便的方法，如`goBack`，`goForward`,`push
```

### redirect

用于路由的重定向，当这个组件出现时，就会执行跳转到对应的`to`路径中，如下例子：

```
const About = ({
  match: {
    params: { name },
  },
}) => (
  // props.match.params.name
  <Fragment>
    {name !== "tom" ? <Redirect to="/" /> : null}
    <h1>About {name}</h1>
    <FakeText />
  </Fragment>
)
```

上述组件当接收到的路由参数`name` 不等于 `tom` 的时候，将会自动重定向到首页

### switch

`swich`组件的作用适用于当匹配到第一个组件的时候，后面的组件就不应该继续匹配

如下例子：

```
<Switch>
  <Route exact path="/" component={Home} />
  <Route path="/about" component={About} />
  <Route path="/profile" component={Profile} />
  <Route path="/:userid" component={User} />
  <Route component={NoMatch} />
</Switch>
```

如果不使用`switch`组件进行包裹

除了一些路由相关的组件之外，`react-router`还提供一些`hooks`，如下：

- useHistory
- useParams
- useLocation

### useHistory

`useHistory`可以让组件内部直接访问`history`，无须通过`props`获取

```
import { useHistory } from "react-router-dom";

const Contact = () => {
  const history = useHistory();
  return (
    <Fragment>
      <h1>Contact</h1>
      <button onClick={() => history.push("/")}>Go to home</button>
    </Fragment>
  );
};
```

### useParams

```
const About = () => {
  const { name } = useParams();
  return (
    // props.match.params.name
    <Fragment>
      {name !== "John Doe" ? <Redirect to="/" /> : null}
      <h1>About {name}</h1>
      <Route component={Contact} />
    </Fragment>
  );
};
```

### useLocation

`useLocation` 会返回当前 `URL`的 `location`对象

```
import { useLocation } from "react-router-dom";

const Contact = () => {
  const { pathname } = useLocation();

  return (
    <Fragment>
      <h1>Contact</h1>
      <p>Current URL: {pathname}</p>
    </Fragment>
  );
};
```

### 三、参数传递

这些路由传递参数主要分成了三种形式：

- 动态路由的方式
- search传递参数
- to传入对象

#### 动态路由

动态路由的概念指的是路由中的路径并不会固定

例如将`path`在`Route`匹配时写成`/detail/:id`，那么 `/detail/abc`、`/detail/123`都可以匹配到该`Route`

```
<NavLink to="/detail/abc123">详情</NavLink>

<Switch>
    ... 其他Route
    <Route path="/detail/:id" component={Detail}/>
    <Route component={NoMatch} />
</Switch>
```

获取参数方式如下：

```
console.log(props.match.params.xxx)
```

#### search传递参数

在跳转的路径中添加了一些query参数；

```
<NavLink to="/detail2?name=why&age=18">详情2</NavLink>

<Switch>
  <Route path="/detail2" component={Detail2}/>
</Switch>
```

获取形式如下：

```
console.log(props.location.search)
```

#### to传入对象

传递方式如下：

```
<NavLink to={{
    pathname: "/detail2", 
    query: {name: "kobe", age: 30},
    state: {height: 1.98, address: "洛杉矶"},
    search: "?apikey=123"
  }}>
  详情2
</NavLink>
```

获取参数的形式如下：

```
console.log(props.location)
```

### 参考文献

- http://react-guide.github.io/react-router-cn/docs/API.html#route

## 14、说说你对 Immutable Data的理解？如何应用在React项目中？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQnQibQpChcib9zFNR3ye0lvaXHdjne4Wqo4732f2XtuDSjhYkibu5TmOVB6QbUiaFan3s3NvHd0WX6EQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

Immutable，不可改变的，在计算机中，即指一旦创建，就不能再被更改的数据

对 `Immutable`对象的任何修改或添加删除操作都会返回一个新的 `Immutable`对象

`Immutable` 实现的原理是 `Persistent Data Structure`（持久化数据结构）:

- 用一种数据结构来保存数据
- 当数据被修改时，会返回一个对象，但是新的对象会尽可能的利用之前的数据结构而不会对内存造成浪费

也就是使用旧数据创建新数据时，要保证旧数据同时可用且不变，同时为了避免 `deepCopy`把所有节点都复制一遍带来的性能损耗，`Immutable` 使用了 `Structural Sharing`（结构共享）

如果对象树中一个节点发生变化，只修改这个节点和受它影响的父节点，其它节点则进行共享

如下图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_gif/gH31uF9VIibQnQibQpChcib9zFNR3ye0lva4icDNqtNcoA81zr25FTjiaZic00crKpMoiaPn08GPmTlm1ia2D1myM54wsQ/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

### 二、如何使用

使用`Immutable`对象最主要的库是`immutable.js`

immutable.js 是一个完全独立的库，无论基于什么框架都可以用它

其出现场景在于弥补 Javascript 没有不可变数据结构的问题，通过 structural sharing来解决的性能问题

内部提供了一套完整的 Persistent Data Structure，还有很多易用的数据类型，如`Collection`、`List`、`Map`、`Set`、`Record`、`Seq`，其中：

- List: 有序索引集，类似 JavaScript 中的 Array
- Map: 无序索引集，类似 JavaScript 中的 Object
- Set: 没有重复值的集合

主要的方法如下：

- fromJS()：将一个js数据转换为Immutable类型的数据

```
const obj = Immutable.fromJS({a:'123',b:'234'})
```

- toJS()：将一个Immutable数据转换为JS类型的数据
- is()：对两个对象进行比较

```
import { Map, is } from 'immutable'
const map1 = Map({ a: 1, b: 1, c: 1 })
const map2 = Map({ a: 1, b: 1, c: 1 })
map1 === map2   //false
Object.is(map1, map2) // false
is(map1, map2) // true
```

- get(key)：对数据或对象取值
- getIn([]) ：对嵌套对象或数组取值，传参为数组，表示位置

```
let abs = Immutable.fromJS({a: {b:2}});
abs.getIn(['a', 'b']) // 2
abs.getIn(['a', 'c']) // 子级没有值

let arr = Immutable.fromJS([1 ,2, 3, {a: 5}]);
arr.getIn([3, 'a']); // 5
arr.getIn([3, 'c']); // 子级没有值
```

- 

如下例子：使用方法如下：

```
import Immutable from 'immutable';
foo = Immutable.fromJS({a: {b: 1}});
bar = foo.setIn(['a', 'b'], 2);   // 使用 setIn 赋值
console.log(foo.getIn(['a', 'b']));  // 使用 getIn 取值，打印 1
console.log(foo === bar);  //  打印 false
```

如果换到原生的`js`，则对应如下：

```
let foo = {a: {b: 1}};
let bar = foo;
bar.a.b = 2;
console.log(foo.a.b);  // 打印 2
console.log(foo === bar);  //  打印 true
```

### 三、在React中应用

使用 `Immutable`可以给 `React` 应用带来性能的优化，主要体现在减少渲染的次数

在做`react`性能优化的时候，为了避免重复渲染，我们会在`shouldComponentUpdate()`中做对比，当返回`true`执行`render`方法

`Immutable`通过`is`方法则可以完成对比，而无需像一样通过深度比较的方式比较

在使用`redux`过程中也可以结合`Immutable`，不使用`Immutable`前修改一个数据需要做一个深拷贝

```
import '_' from 'lodash';

const Component = React.createClass({
  getInitialState() {
    return {
      data: { times: 0 }
    }
  },
  handleAdd() {
    let data = _.cloneDeep(this.state.data);
    data.times = data.times + 1;
    this.setState({ data: data });
  }
}
```

使用 Immutable 后：

```
getInitialState() {
  return {
    data: Map({ times: 0 })
  }
},
  handleAdd() {
    this.setState({ data: this.state.data.update('times', v => v + 1) });
    // 这时的 times 并不会改变
    console.log(this.state.data.get('times'));
  }
```

同理，在`redux`中也可以将数据进行`fromJS`处理

```
import * as constants from './constants'
import {fromJS} from 'immutable'
const defaultState = fromJS({ //将数据转化成immutable数据
    home:true,
    focused:false,
    mouseIn:false,
    list:[],
    page:1,
    totalPage:1
})
export default(state=defaultState,action)=>{
    switch(action.type){
        case constants.SEARCH_FOCUS:
            return state.set('focused',true) //更改immutable数据
        case constants.CHANGE_HOME_ACTIVE:
            return state.set('home',action.value)
        case constants.SEARCH_BLUR:
            return state.set('focused',false)
        case constants.CHANGE_LIST:
            // return state.set('list',action.data).set('totalPage',action.totalPage)
            //merge效率更高，执行一次改变多个数据
            return state.merge({
                list:action.data,
                totalPage:action.totalPage
            })
        case constants.MOUSE_ENTER:
            return state.set('mouseIn',true)
        case constants.MOUSE_LEAVE:
            return state.set('mouseIn',false)
        case constants.CHANGE_PAGE:
            return state.set('page',action.page)
        default:
            return state
    }
}
```

### 参考文献

- https://zhuanlan.zhihu.com/p/20295971?spm=a2c4e.11153940.blogcont69516.18.4f275a00EzBHjr&columnSlug=purerender
- https://www.jianshu.com/p/7bf04638e82a

## 15、说说React render方法的原理？在什么时候会被触发？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTf1ZtJbBmic3eTiaBCHK4FgMicfBdEOvdpDrcpQScq9iaWoQofCUpcDatfTyt0Xia86CpyPSwcCslk7vw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、原理

首先，`render`函数在`react`中有两种形式：

在类组件中，指的是`render`方法：

```
class Foo extends React.Component {
    render() {
        return <h1> Foo </h1>;
    }
}
```

在函数组件中，指的是函数组件本身：

```
function Foo() {
    return <h1> Foo </h1>;
}
```

在`render`中，我们会编写`jsx`，`jsx`通过`babel`编译后就会转化成我们熟悉的`js`格式，如下：

```
return (
  <div className='cn'>
    <Header> hello </Header>
    <div> start </div>
    Right Reserve
  </div>
)
```

`babel`编译后：

```
return (
  React.createElement(
    'div',
    {
      className : 'cn'
    },
    React.createElement(
      Header,
      null,
      'hello'
    ),
    React.createElement(
      'div',
      null,
      'start'
    ),
    'Right Reserve'
  )
)
```

从名字上来看，`createElement`方法用来元素的

在`react`中，这个元素就是虚拟`DOM`树的节点，接收三个参数：

- type：标签
- attributes：标签属性，若无则为null
- children：标签的子节点

这些虚拟`DOM`树最终会渲染成真实`DOM`

在`render`过程中，`React` 将新调用的 `render`函数返回的树与旧版本的树进行比较，这一步是决定如何更新 `DOM` 的必要步骤，然后进行 `diff` 比较，更新 `DOM`树

### 二、触发时机

`render`的执行时机主要分成了两部分：

- 类组件调用 setState 修改状态

```
class Foo extends React.Component {
  state = { count: 0 };

  increment = () => {
    const { count } = this.state;

    const newCount = count < 10 ? count + 1 : count;

    this.setState({ count: newCount });
  };

  render() {
    const { count } = this.state;
    console.log("Foo render");

    return (
      <div>
        <h1> {count} </h1>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}
```

点击按钮，则调用`setState`方法，无论`count`发生变化与否，控制台都会输出`Foo render`，证明`render`执行了

- 函数组件通过`useState hook`修改状态

```
function Foo() {
  const [count, setCount] = useState(0);

  function increment() {
    const newCount = count < 10 ? count + 1 : count;
    setCount(newCount);
  }

  console.log("Foo render");
  
  return (
    <div>
      <h1> {count} </h1>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

函数组件通过`useState`这种形式更新数据，当数组的值不发生改变了，就不会触发`render`

- 类组件重新渲染

```
class App extends React.Component {
  state = { name: "App" };
  render() {
    return (
      <div className="App">
        <Foo />
        <button onClick={() => this.setState({ name: "App" })}>
          Change name
        </button>
      </div>
    );
  }
}

function Foo() {
  console.log("Foo render");

  return (
    <div>
      <h1> Foo </h1>
    </div>
  );
}
```

只要点击了 `App` 组件内的 `Change name` 按钮，不管 `Foo` 具体实现是什么，都会被重新`render`渲染

- 函数组件重新渲染

```
function App(){
    const [name,setName] = useState('App')

    return (
        <div className="App">
            <Foo />
            <button onClick={() => setName("aaa")}>
                { name }
            </button>
      </div>
    )
}

function Foo() {
  console.log("Foo render");

  return (
    <div>
      <h1> Foo </h1>
    </div>
  );
}
```

可以发现，使用`useState`来更新状态的时候，只有首次会触发`Foo render`，后面并不会导致`Foo render`

### 三、总结

```
render`函数里面可以编写`JSX`，转化成`createElement`这种形式，用于生成虚拟`DOM`，最终转化成真实`DOM
```

在`React` 中，类组件只要执行了 `setState` 方法，就一定会触发 `render` 函数执行，函数组件使用`useState`更改状态不一定导致重新`render`

组件的`props` 改变了，不一定触发 `render` 函数的执行，但是如果 `props` 的值来自于父组件或者祖先组件的 `state`

在这种情况下，父组件或者祖先组件的 `state` 发生了改变，就会导致子组件的重新渲染

所以，一旦执行了`setState`就会执行`render`方法，`useState` 会判断当前值有无发生改变确定是否执行`render`方法，一旦父组件发生渲染，子组件也会渲染

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTf1ZtJbBmic3eTiaBCHK4FgM2PRrPqibo7rwia3iawATkJuxhPOvgKstMO8LhgRWSGxQuC7WbVeul0VlQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 参考文献

- https://zhuanlan.zhihu.com/p/45091185
- https://juejin.cn/post/6844904181493415950

## 16、说说React Jsx转换成真实DOM过程？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSKRmDsBPy6myicoAQmdAoqyUPv9oYyhB0or9LYa37HxaAJtzziaoUBh7CxKElQJPViadYicle75IHqWA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

`react`通过将组件编写的`JSX`映射到屏幕，以及组件中的状态发生了变化之后 `React`会将这些「变化」更新到屏幕上

在前面文章了解中，`JSX`通过`babel`最终转化成`React.createElement`这种形式，例如：

```
<div>
  <img src="avatar.png" className="profile" />
  <Hello />
</div>
```

会被`bebel`转化成如下：

```
React.createElement(
  "div",
  null,
  React.createElement("img", {
    src: "avatar.png",
    className: "profile"
  }),
  React.createElement(Hello, null)
);
```

在转化过程中，`babel`在编译时会判断 JSX 中组件的首字母：

- 当首字母为小写时，其被认定为原生 `DOM` 标签，`createElement` 的第一个变量被编译为字符串
- 当首字母为大写时，其被认定为自定义组件，createElement 的第一个变量被编译为对象

最终都会通过`RenderDOM.render(...)`方法进行挂载，如下：

```
ReactDOM.render(<App />,  document.getElementById("root"));
```

### 二、过程

在`react`中，节点大致可以分成四个类别：

- 原生标签节点
- 文本节点
- 函数组件
- 类组件

如下所示：

```
class ClassComponent extends Component {
  static defaultProps = {
    color: "pink"
  };
  render() {
    return (
      <div className="border">
        <h3>ClassComponent</h3>
        <p className={this.props.color}>{this.props.name}</p>
      </div>
    );
  }
}

function FunctionComponent(props) {
  return (
    <div className="border">
      FunctionComponent
      <p>{props.name}</p>
    </div>
  );
}

const jsx = (
  <div className="border">
    <p>xx</p>
    <a href="https://www.xxx.com/">xxx</a>
    <FunctionComponent name="函数组件" />
    <ClassComponent name="类组件" color="red" />
  </div>
);
```

这些类别最终都会被转化成`React.createElement`这种形式

`React.createElement`其被调用时会传⼊标签类型`type`，标签属性`props`及若干子元素`children`，作用是生成一个虚拟`Dom`对象，如下所示：

```
function createElement(type, config, ...children) {
    if (config) {
        delete config.__self;
        delete config.__source;
    }
    // ! 源码中做了详细处理，⽐如过滤掉key、ref等
    const props = {
        ...config,
        children: children.map(child =>
   typeof child === "object" ? child : createTextNode(child)
  )
    };
    return {
        type,
        props
    };
}
function createTextNode(text) {
    return {
        type: TEXT,
        props: {
            children: [],
            nodeValue: text
        }
    };
}
export default {
    createElement
};
```

`createElement`会根据传入的节点信息进行一个判断：

- 如果是原生标签节点， type 是字符串，如div、span
- 如果是文本节点， type就没有，这里是 TEXT
- 如果是函数组件，type 是函数名
- 如果是类组件，type 是类名

虚拟`DOM`会通过`ReactDOM.render`进行渲染成真实`DOM`，使用方法如下：

```
ReactDOM.render(element, container[, callback])
```

当首次调用时，容器节点里的所有 `DOM` 元素都会被替换，后续的调用则会使用 `React` 的 `diff`算法进行高效的更新

如果提供了可选的回调函数`callback`，该回调将在组件被渲染或更新之后被执行

`render`大致实现方法如下：

```
function render(vnode, container) {
    console.log("vnode", vnode); // 虚拟DOM对象
    // vnode _> node
    const node = createNode(vnode, container);
    container.appendChild(node);
}

// 创建真实DOM节点
function createNode(vnode, parentNode) {
    let node = null;
    const {type, props} = vnode;
    if (type === TEXT) {
        node = document.createTextNode("");
    } else if (typeof type === "string") {
        node = document.createElement(type);
    } else if (typeof type === "function") {
        node = type.isReactComponent
            ? updateClassComponent(vnode, parentNode)
        : updateFunctionComponent(vnode, parentNode);
    } else {
        node = document.createDocumentFragment();
    }
    reconcileChildren(props.children, node);
    updateNode(node, props);
    return node;
}

// 遍历下子vnode，然后把子vnode->真实DOM节点，再插入父node中
function reconcileChildren(children, node) {
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        if (Array.isArray(child)) {
            for (let j = 0; j < child.length; j++) {
                render(child[j], node);
            }
        } else {
            render(child, node);
        }
    }
}
function updateNode(node, nextVal) {
    Object.keys(nextVal)
        .filter(k => k !== "children")
        .forEach(k => {
        if (k.slice(0, 2) === "on") {
            let eventName = k.slice(2).toLocaleLowerCase();
            node.addEventListener(eventName, nextVal[k]);
        } else {
            node[k] = nextVal[k];
        }
    });
}

// 返回真实dom节点
// 执行函数
function updateFunctionComponent(vnode, parentNode) {
    const {type, props} = vnode;
    let vvnode = type(props);
    const node = createNode(vvnode, parentNode);
    return node;
}

// 返回真实dom节点
// 先实例化，再执行render函数
function updateClassComponent(vnode, parentNode) {
    const {type, props} = vnode;
    let cmp = new type(props);
    const vvnode = cmp.render();
    const node = createNode(vvnode, parentNode);
    return node;
}
export default {
    render
};
```

### 三、总结

在`react`源码中，虚拟`Dom`转化成真实`Dom`整体流程如下图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSKRmDsBPy6myicoAQmdAoqyoGEGyOnYx5xia5yqIBSPzD0qxGorrmMraz4APlyJ1rBVdjlutficvVVA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

其渲染流程如下所示：

- 使用React.createElement或JSX编写React组件，实际上所有的 JSX 代码最后都会转换成React.createElement(...) ，Babel帮助我们完成了这个转换的过程。
- createElement函数对key和ref等特殊的props进行处理，并获取defaultProps对默认props进行赋值，并且对传入的孩子节点进行处理，最终构造成一个虚拟DOM对象
- ReactDOM.render将生成好的虚拟DOM渲染到指定容器上，其中采用了批处理、事务等机制并且对特定浏览器进行了性能优化，最终转换为真实DOM

### 参考文献

- https://bbs.huaweicloud.com/blogs/265503)
- https://huang-qing.github.io/react/2019/05/29/React-VirDom/
- https://segmentfault.com/a/1190000018891454

## 17、说说 React 性能优化的手段有哪些？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSMT8ib1LsKFGLvlCrNeIic1mcHDRFjJXaFibicggQ4KdTbw3eSLsVWjD8zfu1oT3rVY0dCtWkyEgSQyw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

`React`凭借`virtual DOM`和`diff`算法拥有高效的性能，但是某些情况下，性能明显可以进一步提高

在前面文章中，我们了解到类组件通过调用`setState`方法， 就会导致`render`，父组件一旦发生`render`渲染，子组件一定也会执行`render`渲染

当我们想要更新一个子组件的时候，如下图绿色部分：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSMT8ib1LsKFGLvlCrNeIic1mKNzFzXlNdXZ03yQF9k9sGibuE1gic5IiaqaIfQJWvBsebOWjbZv9HUvxw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

理想状态只调用该路径下的组件`render`：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSMT8ib1LsKFGLvlCrNeIic1mKTZiaiaGro5FHDicVXfDNRPOJa1SlGxD9mMT52ytMChRDQkPkibbaNiaBpQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

但是`react`的默认做法是调用所有组件的`render`，再对生成的虚拟`DOM`进行对比（黄色部分），如不变则不进行更新

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSMT8ib1LsKFGLvlCrNeIic1mmKfxUmhialYwHtf4YhljiapURVibOJOwJWsxFep0nIib1BDCd8Bpo5ahvQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

从上图可见，黄色部分`diff`算法对比是明显的性能浪费的情况

### 二、如何做

在[React中如何避免不必要的render](https://mp.weixin.qq.com/s?__biz=MzU1OTgxNDQ1Nw==&mid=2247488734&idx=2&sn=a4e97e070061e2b99edc4fdefb622e8c&scene=21#wechat_redirect)中，我们了解到如何避免不必要的`render`来应付上面的问题，主要手段是通过`shouldComponentUpdate`、`PureComponent`、`React.memo`，这三种形式这里就不再复述

除此之外， 常见性能优化常见的手段有如下：

- 避免使用内联函数
- 使用 React Fragments 避免额外标记
- 使用 Immutable
- 懒加载组件
- 事件绑定方式
- 服务端渲染

#### 避免使用内联函数

如果我们使用内联函数，则每次调用`render`函数时都会创建一个新的函数实例，如下：

```
import React from "react";

export default class InlineFunctionComponent extends React.Component {
  render() {
    return (
      <div>
        <h1>Welcome Guest</h1>
        <input type="button" onClick={(e) => { this.setState({inputValue: e.target.value}) }} value="Click For Inline Function" />
      </div>
    )
  }
}
```

我们应该在组件内部创建一个函数，并将事件绑定到该函数本身。这样每次调用 `render` 时就不会创建单独的函数实例，如下：

```
import React from "react";

export default class InlineFunctionComponent extends React.Component {
  
  setNewStateData = (event) => {
    this.setState({
      inputValue: e.target.value
    })
  }
  
  render() {
    return (
      <div>
        <h1>Welcome Guest</h1>
        <input type="button" onClick={this.setNewStateData} value="Click For Inline Function" />
      </div>
    )
  }
}
```

#### 使用 React Fragments 避免额外标记

用户创建新组件时，每个组件应具有单个父标签。父级不能有两个标签，所以顶部要有一个公共标签，所以我们经常在组件顶部添加额外标签`div`

这个额外标签除了充当父标签之外，并没有其他作用，这时候则可以使用`fragement`

其不会向组件引入任何额外标记，但它可以作为父级标签的作用，如下所示：

```
export default class NestedRoutingComponent extends React.Component {
    render() {
        return (
            <>
                <h1>This is the Header Component</h1>
                <h2>Welcome To Demo Page</h2>
            </>
        )
    }
}
```

#### 事件绑定方式

在[事件绑定方式](https://mp.weixin.qq.com/s?__biz=MzU1OTgxNDQ1Nw==&mid=2247488384&idx=2&sn=c072d2cd8afec35a9f293f222a928f91&scene=21#wechat_redirect)中，我们了解到四种事件绑定的方式

从性能方面考虑，在`render`方法中使用`bind`和`render`方法中使用箭头函数这两种形式在每次组件`render`的时候都会生成新的方法实例，性能欠缺

而`constructor`中`bind`事件与定义阶段使用箭头函数绑定这两种形式只会生成一个方法实例，性能方面会有所改善

#### 使用 Immutable

在[理解Immutable中](https://mp.weixin.qq.com/s?__biz=MzU1OTgxNDQ1Nw==&mid=2247488676&idx=1&sn=05dde7d0cf439556297b2b09e5afd71b&scene=21#wechat_redirect)，我们了解到使用 `Immutable`可以给 `React` 应用带来性能的优化，主要体现在减少渲染的次数

在做`react`性能优化的时候，为了避免重复渲染，我们会在`shouldComponentUpdate()`中做对比，当返回`true`执行`render`方法

`Immutable`通过`is`方法则可以完成对比，而无需像一样通过深度比较的方式比较

#### 懒加载组件

从工程方面考虑，`webpack`存在代码拆分能力，可以为应用创建多个包，并在运行时动态加载，减少初始包的大小

而在`react`中使用到了`Suspense`和 `lazy`组件实现代码拆分功能，基本使用如下：

```
const johanComponent = React.lazy(() => import(/* webpackChunkName: "johanComponent" */ './myAwesome.component'));
 
export const johanAsyncComponent = props => (
  <React.Suspense fallback={<Spinner />}>
    <johanComponent {...props} />
  </React.Suspense>
);
```

#### 服务端渲染

采用服务端渲染端方式，可以使用户更快的看到渲染完成的页面

服务端渲染，需要起一个`node`服务，可以使用`express`、`koa`等，调用`react`的`renderToString`方法，将根组件渲染成字符串，再输出到响应中

例如：

```
import { renderToString } from "react-dom/server";
import MyPage from "./MyPage";
app.get("/", (req, res) => {
  res.write("<!DOCTYPE html><html><head><title>My Page</title></head><body>");
  res.write("<div id='content'>");  
  res.write(renderToString(<MyPage/>));
  res.write("</div></body></html>");
  res.end();
});
```

客户端使用render方法来生成HTML

```
import ReactDOM from 'react-dom';
import MyPage from "./MyPage";
ReactDOM.render(<MyPage />, document.getElementById('app'));
```

#### 其他

除此之外，还存在的优化手段有组件拆分、合理使用`hooks`等性能优化手段...

### 三、总结

通过上面初步学习，我们了解到`react`常见的性能优化可以分成三个层面：

- 代码层面
- 工程层面
- 框架机制层面

通过这三个层面的优化结合，能够使基于`react`项目的性能更上一层楼

### 参考文献

- https://zhuanlan.zhihu.com/p/108666350
- https://segmentfault.com/a/1190000007811296

## 18、说说你在React项目是如何捕获错误的？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTib4PFZ0TNDPrPMoFRibY64iblTvt5AcKbpVt0asdxXyl4aXVSvoWWYu5R3bS2oViafmPjhiakqJ4zXrg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

错误在我们日常编写代码是非常常见的

举个例子，在`react`项目中去编写组件内`JavaScript`代码错误会导致 `React` 的内部状态被破坏，导致整个应用崩溃，这是不应该出现的现象

作为一个框架，`react`也有自身对于错误的处理的解决方案

### 二、如何做

为了解决出现的错误导致整个应用崩溃的问题，`react16`引用了「错误边界」新的概念

错误边界是一种 `React` 组件，这种组件可以捕获发生在其子组件树任何位置的 `JavaScript` 错误，并打印这些错误，同时展示降级 `UI`，而并不会渲染那些发生崩溃的子组件树

错误边界在渲染期间、生命周期方法和整个组件树的构造函数中捕获错误

形成错误边界组件的两个条件：

- 使用了  static getDerivedStateFromError()
- 使用了 componentDidCatch()

抛出错误后，请使用 `static getDerivedStateFromError()` 渲染备用 UI ，使用 `componentDidCatch()` 打印错误信息，如下：

```
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}
```

然后就可以把自身组件的作为错误边界的子组件，如下：

```
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>
```

下面这些情况无法捕获到异常：

- 事件处理
- 异步代码
- 服务端渲染
- 自身抛出来的错误

在`react 16`版本之后，会把渲染期间发生的所有错误打印到控制台

除了错误信息和 JavaScript 栈外，React 16 还提供了组件栈追踪。现在你可以准确地查看发生在组件树内的错误信息：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTib4PFZ0TNDPrPMoFRibY64ibrdgxX4nJlcyAo5yENPJ4zfBEpw8ziaPzzQNQcaiakBYnwPt3eAV5GwBg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

可以看到在错误信息下方文字中存在一个组件栈，便于我们追踪错误

对于错误边界无法捕获的异常，如事件处理过程中发生问题并不会捕获到，是因为其不会在渲染期间触发，并不会导致渲染时候问题

这种情况可以使用`js`的`try...catch...`语法，如下：

```
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    try {
      // 执行操作，如有错误则会抛出
    } catch (error) {
      this.setState({ error });
    }
  }

  render() {
    if (this.state.error) {
      return <h1>Caught an error.</h1>
    }
    return <button onClick={this.handleClick}>Click Me</button>
  }
}
```

除此之外还可以通过监听`onerror`事件

```
window.addEventListener('error', function(event) { ... })
```

### 参考文献

- https://zh-hans.reactjs.org/docs/error-boundaries.html

## 19、说说React服务端渲染怎么做？原理是什么？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSiagXuvhZsuEWypickByw6vg7nkicoWicyCsicTTovWgjDYzEv7EfGhb7A81ATgCznS6ITMNOet9SduVw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

在[SSR中](https://mp.weixin.qq.com/s?__biz=MzU1OTgxNDQ1Nw==&mid=2247484605&idx=1&sn=92e2e45cbba021fe685f0f8252ffe8b4&scene=21#wechat_redirect)，我们了解到`Server-Side Rendering` ，简称`SSR`，意为服务端渲染

指由服务侧完成页面的 `HTML` 结构拼接的页面处理技术，发送到浏览器，然后为其绑定状态与事件，成为完全可交互页面的过程

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSiagXuvhZsuEWypickByw6vgwBCpevAkom3ib4bOfVhMiaIaNlukr0iaAibZhmKWYo0Uhia6byPGRsRtHDA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

其解决的问题主要有两个：

- SEO，由于搜索引擎爬虫抓取工具可以直接查看完全渲染的页面
- 加速首屏加载，解决首屏白屏问题

### 二、如何做

在`react`中，实现`SSR`主要有两种形式：

- 手动搭建一个 SSR 框架
- 使用成熟的SSR 框架，如 Next.JS

这里主要以手动搭建一个`SSR`框架进行实现

首先通过`express`启动一个`app.js`文件，用于监听3000端口的请求，当请求根目录时，返回`HTML`，如下：

```
const express = require('express')
const app = express()
app.get('/', (req,res) => res.send(`
<html>
   <head>
       <title>ssr demo</title>
   </head>
   <body>
       Hello world
   </body>
</html>
`))

app.listen(3000, () => console.log('Exampleapp listening on port 3000!'))
```

然后再服务器中编写`react`代码，在`app.js`中进行应引用

```
import React from 'react'

const Home = () =>{

    return <div>home</div>

}

export default Home
```

为了让服务器能够识别`JSX`，这里需要使用`webpakc`对项目进行打包转换，创建一个配置文件`webpack.server.js`并进行相关配置，如下：

```
const path = require('path')    //node的path模块
const nodeExternals = require('webpack-node-externals')

module.exports = {
    target:'node',
    mode:'development',           //开发模式
    entry:'./app.js',             //入口
    output: {                     //打包出口
        filename:'bundle.js',     //打包后的文件名
        path:path.resolve(__dirname,'build')    //存放到根目录的build文件夹
    },
    externals: [nodeExternals()],  //保持node中require的引用方式
    module: {
        rules: [{                  //打包规则
           test:   /\.js?$/,       //对所有js文件进行打包
           loader:'babel-loader',  //使用babel-loader进行打包
           exclude: /node_modules/,//不打包node_modules中的js文件
           options: {
               presets: ['react','stage-0',['env', { 
                                  //loader时额外的打包规则,对react,JSX，ES6进行转换
                    targets: {
                        browsers: ['last 2versions']   //对主流浏览器最近两个版本进行兼容
                    }
               }]]
           }
       }]
    }
}
```

接着借助`react-dom`提供了服务端渲染的 `renderToString`方法，负责把`React`组件解析成`html`

```
import express from 'express'
import React from 'react'//引入React以支持JSX的语法
import { renderToString } from 'react-dom/server'//引入renderToString方法
import Home from'./src/containers/Home'

const app= express()
const content = renderToString(<Home/>)
app.get('/',(req,res) => res.send(`
<html>
   <head>
       <title>ssr demo</title>
   </head>
   <body>
        ${content}
   </body>
</html>
`))

app.listen(3001, () => console.log('Exampleapp listening on port 3001!'))
```

上面的过程中，已经能够成功将组件渲染到了页面上

但是像一些事件处理的方法，是无法在服务端完成，因此需要将组件代码在浏览器中再执行一遍，这种服务器端和客户端共用一套代码的方式就称之为「同构」

重构通俗讲就是一套React代码在服务器上运行一遍，到达浏览器又运行一遍：

- 服务端渲染完成页面结构
- 浏览器端渲染完成事件绑定

浏览器实现事件绑定的方式为让浏览器去拉取`JS`文件执行，让`JS`代码来控制，因此需要引入`script`标签

通过`script`标签为页面引入客户端执行的`react`代码，并通过`express`的`static`中间件为`js`文件配置路由，修改如下：

```
import express from 'express'
import React from 'react'//引入React以支持JSX的语法
import { renderToString } from'react-dom/server'//引入renderToString方法
import Home from './src/containers/Home'
 
const app = express()
app.use(express.static('public'));
//使用express提供的static中间件,中间件会将所有静态文件的路由指向public文件夹
 const content = renderToString(<Home/>)
 
app.get('/',(req,res)=>res.send(`
<html>
   <head>
       <title>ssr demo</title>
   </head>
   <body>
        ${content}
   <script src="/index.js"></script>
   </body>
</html>
`))

 app.listen(3001, () =>console.log('Example app listening on port 3001!'))
```

然后再客户端执行以下`react`代码，新建`webpack.client.js`作为客户端React代码的`webpack`配置文件如下：

```
const path = require('path')                    //node的path模块

module.exports = {
    mode:'development',                         //开发模式
    entry:'./src/client/index.js',              //入口
    output: {                                   //打包出口
        filename:'index.js',                    //打包后的文件名
        path:path.resolve(__dirname,'public')   //存放到根目录的build文件夹
    },
    module: {
        rules: [{                               //打包规则
           test:   /\.js?$/,                    //对所有js文件进行打包
           loader:'babel-loader',               //使用babel-loader进行打包
           exclude: /node_modules/,             //不打包node_modules中的js文件
           options: {
               presets: ['react','stage-0',['env', {     
                    //loader时额外的打包规则,这里对react,JSX进行转换
                    targets: {
                        browsers: ['last 2versions']   //对主流浏览器最近两个版本进行兼容
                    }
               }]]
           }
       }]
    }
}
```

这种方法就能够简单实现首页的`react`服务端渲染，过程对应如下图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSiagXuvhZsuEWypickByw6vg63oSlYEZXlPxElCIzichvpW3wXibBRP6oGYyNXWKJVEibsPbUqnhPrLXQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在做完初始渲染的时候，一个应用会存在路由的情况，配置信息如下：

```
import React from 'react'                   //引入React以支持JSX
import { Route } from 'react-router-dom'    //引入路由
import Home from './containers/Home'        //引入Home组件

export default (
    <div>
        <Route path="/" exact component={Home}></Route>
    </div>
)
```

然后可以通过`index.js`引用路由信息，如下：

```
import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter } from'react-router-dom'
import Router from'../Routers'

const App= () => {
    return (
        <BrowserRouter>
           {Router}
        </BrowserRouter>
    )
}

ReactDom.hydrate(<App/>, document.getElementById('root'))
```

这时候控制台会存在报错信息，原因在于每个`Route`组件外面包裹着一层`div`，但服务端返回的代码中并没有这个`div`

解决方法只需要将路由信息在服务端执行一遍，使用使用`StaticRouter`来替代`BrowserRouter`，通过`context`进行参数传递

```
import express from 'express'
import React from 'react'//引入React以支持JSX的语法
import { renderToString } from 'react-dom/server'//引入renderToString方法
import { StaticRouter } from 'react-router-dom'
import Router from '../Routers'
 
const app = express()
app.use(express.static('public'));
//使用express提供的static中间件,中间件会将所有静态文件的路由指向public文件夹

app.get('/',(req,res)=>{
    const content  = renderToString((
        //传入当前path
        //context为必填参数,用于服务端渲染参数传递
        <StaticRouter location={req.path} context={{}}>
           {Router}
        </StaticRouter>
    ))
    res.send(`
   <html>
       <head>
           <title>ssr demo</title>
       </head>
       <body>
       <div id="root">${content}</div>
       <script src="/index.js"></script>
       </body>
   </html>
    `)
})


app.listen(3001, () => console.log('Exampleapp listening on port 3001!'))
```

这样也就完成了路由的服务端渲染

### 三、原理

整体`react`服务端渲染原理并不复杂，具体如下：

`node server` 接收客户端请求，得到当前的请求`url` 路径，然后在已有的路由表内查找到对应的组件，拿到需要请求的数据，将数据作为 `props`、`context`或者`store` 形式传入组件

然后基于 `react` 内置的服务端渲染方法 `renderToString()`把组件渲染为 `html`字符串在把最终的 `html`进行输出前需要将数据注入到浏览器端

浏览器开始进行渲染和节点对比，然后执行完成组件内事件绑定和一些交互，浏览器重用了服务端输出的 `html` 节点，整个流程结束

### 参考文献

- https://zhuanlan.zhihu.com/p/52693113
- https://segmentfault.com/a/1190000020417285
- https://juejin.cn/post/6844904000387563533#heading-14

# 二、webpack

## 1、说说你对Webpack的理解？解决了什么问题？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS4XoprRmkIYYWkN32QtOlSFicG5tib0uyibjHr3uY8lth8IVBXL3SEBj4fhz0icdswJTA7yEBibtYwMFg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、背景

`Webpack` 最初的目标是实现前端项目的模块化，旨在更高效地管理和维护项目中的每一个资源

#### 模块化

最早的时候，我们会通过文件划分的形式实现模块化，也就是将每个功能及其相关状态数据各自单独放到不同的`JS` 文件中

约定每个文件是一个独立的模块，然后再将这些`js`文件引入到页面，一个`script`标签对应一个模块，然后调用模块化的成员

```
<script src="module-a.js"></script>
<script src="module-b.js"></script>
```

但这种模块弊端十分的明显，模块都是在全局中工作，大量模块成员污染了环境，模块与模块之间并没有依赖关系、维护困难、没有私有空间等问题

项目一旦变大，上述问题会尤其明显

随后，就出现了命名空间方式，规定每个模块只暴露一个全局对象，然后模块的内容都挂载到这个对象中

```
window.moduleA = {
  method1: function () {
    console.log('moduleA#method1')
  }
}
```

这种方式也并没有解决第一种方式的依赖等问题

再后来，我们使用立即执行函数为模块提供私有空间，通过参数的形式作为依赖声明，如下

```
// module-a.js
(function ($) {
  var name = 'module-a'

  function method1 () {
    console.log(name + '#method1')
    $('body').animate({ margin: '200px' })
  }
    
  window.moduleA = {
    method1: method1
  }
})(jQuery)
```

上述的方式都是早期解决模块的方式，但是仍然存在一些没有解决的问题。例如，我们是用过`script`标签在页面引入这些模块的，这些模块的加载并不受代码的控制，时间一久维护起来也十分的麻烦

理想的解决方式是，在页面中引入一个`JS`入口文件，其余用到的模块可以通过代码控制，按需加载进来

除了模块加载的问题以外，还需要规定模块化的规范，如今流行的则是`CommonJS`、`ES Modules`

### 二、问题

从后端渲染的`JSP`、`PHP`，到前端原生`JavaScript`，再到`jQuery`开发，再到目前的三大框架`Vue`、`React`、`Angular`

开发方式，也从`javascript`到后面的`es5`、`es6、7、8、9、10`，再到`typescript`，包括编写`CSS`的预处理器`less`、`scss`等

现代前端开发已经变得十分的复杂，所以我们开发过程中会遇到如下的问题：

- 需要通过模块化的方式来开发
- 使用一些高级的特性来加快我们的开发效率或者安全性，比如通过ES6+、TypeScript开发脚本逻辑，通过sass、less等方式来编写css样式代码
- 监听文件的变化来并且反映到浏览器上，提高开发的效率
- JavaScript 代码需要模块化，HTML 和 CSS 这些资源文件也会面临需要被模块化的问题
- 开发完成后我们还需要将代码进行压缩、合并以及其他相关的优化

而`webpack`恰巧可以解决以上问题

### 三、是什么

`webpack` 是一个用于现代`JavaScript`应用程序的静态模块打包工具

- 静态模块

这里的静态模块指的是开发阶段，可以被 `webpack` 直接引用的资源（可以直接被获取打包进`bundle.js`的资源）

当 `webpack`处理应用程序时，它会在内部构建一个依赖图，此依赖图对应映射到项目所需的每个模块（不再局限`js`文件），并生成一个或多个 `bundle`

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS4XoprRmkIYYWkN32QtOlSx0x8LpLGPwJ3IzHSgL5Z66m4okhLN9FiagicP4dHsu8a8vXKlnUrLT9w/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### `webpack`的能力：

「编译代码能力」，提高效率，解决浏览器兼容问题![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS4XoprRmkIYYWkN32QtOlSP0f7soianuZlAoH6jzo9Lxia10FGg5CQbqSauoDWSLc3yw4dD9NM3xyQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)「模块整合能力」，提高性能，可维护性，解决浏览器频繁请求文件的问题![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS4XoprRmkIYYWkN32QtOlSV3cOV4cqFZiap0q0gT15NQcYDFmGPtCiapefPBcr8yUicKvX1EVHnXicsA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)「万物皆可模块能力」，项目维护性增强，支持不同种类的前端模块类型，统一的模块化方案，所有资源文件的加载都可以通过代码控制![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS4XoprRmkIYYWkN32QtOlSqbaP8wTz4p3TBdb8Zu7ACzPl4L2pAdWae7Yuiconjhj8lDZySk1Txsg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 参考文献

- https://webpack.docschina.org/concepts/
- https://zhuanlan.zhihu.com/p/267875652

## 2、说说webpack的构建流程?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTZPrfr0rw0Mz6Nhq3OdRrXTCaRl5eHB7K4Ic5GuCGJOCD0wb9L0vrQhvLvDiaIL5Q5mO7YajZlmDw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、运行流程

`webpack` 的运行流程是一个串行的过程，它的工作流程就是将各个插件串联起来

在运行过程中会广播事件，插件只需要监听它所关心的事件，就能加入到这条`webpack`机制中，去改变`webpack`的运作，使得整个系统扩展性良好

从启动到结束会依次执行以下三大步骤：

- 初始化流程：从配置文件和 `Shell` 语句中读取与合并参数，并初始化需要使用的插件和配置插件等执行环境所需要的参数
- 编译构建流程：从 Entry 发出，针对每个 Module 串行调用对应的 Loader 去翻译文件内容，再找到该 Module 依赖的 Module，递归地进行编译处理
- 输出流程：对编译后的 Module 组合成 Chunk，把 Chunk 转换成文件，输出到文件系统

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTZPrfr0rw0Mz6Nhq3OdRrXtRK4icSubakia1d1CNiamdgxVg63LKiaJ7vE4WibZyVUMicwicUcQsQLd5mpg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 初始化流程

从配置文件和 `Shell` 语句中读取与合并参数，得出最终的参数

配置文件默认下为`webpack.config.js`，也或者通过命令的形式指定配置文件，主要作用是用于激活`webpack`的加载项和插件

关于文件配置内容分析，如下注释：

```
var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
var pathToReact = path.resolve(node_modules, 'react/dist/react.min.js');

module.exports = {
  // 入口文件，是模块构建的起点，同时每一个入口文件对应最后生成的一个 chunk。
  entry: './path/to/my/entry/file.js'，
  // 文件路径指向(可加快打包过程)。
  resolve: {
    alias: {
      'react': pathToReact
    }
  },
  // 生成文件，是模块构建的终点，包括输出文件与输出路径。
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },
  // 这里配置了处理各模块的 loader ，包括 css 预处理 loader ，es6 编译 loader，图片处理 loader。
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ],
    noParse: [pathToReact]
  },
  // webpack 各插件对象，在 webpack 的事件流中执行对应的方法。
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
webpack` 将 `webpack.config.js` 中的各个配置项拷贝到 `options` 对象中，并加载用户配置的 `plugins
```

完成上述步骤之后，则开始初始化`Compiler`编译对象，该对象掌控者`webpack`声明周期，不执行具体的任务，只是进行一些调度工作

```
class Compiler extends Tapable {
    constructor(context) {
        super();
        this.hooks = {
            beforeCompile: new AsyncSeriesHook(["params"]),
            compile: new SyncHook(["params"]),
            afterCompile: new AsyncSeriesHook(["compilation"]),
            make: new AsyncParallelHook(["compilation"]),
            entryOption: new SyncBailHook(["context", "entry"])
            // 定义了很多不同类型的钩子
        };
        // ...
    }
}

function webpack(options) {
  var compiler = new Compiler();
  ...// 检查options,若watch字段为true,则开启watch线程
  return compiler;
}
...
```

`Compiler` 对象继承自 `Tapable`，初始化时定义了很多钩子函数

### 编译构建流程

根据配置中的 `entry` 找出所有的入口文件

```
module.exports = {
  entry: './src/file.js'
}
```

初始化完成后会调用`Compiler`的`run`来真正启动`webpack`编译构建流程，主要流程如下：

- `compile` 开始编译
- `make` 从入口点分析模块及其依赖的模块，创建这些模块对象
- `build-module` 构建模块
- `seal` 封装构建结果
- `emit` 把各个chunk输出到结果文件

#### **compile 编译**

执行了`run`方法后，首先会触发`compile`，主要是构建一个`Compilation`对象

该对象是编译阶段的主要执行者，主要会依次下述流程：执行模块创建、依赖收集、分块、打包等主要任务的对象

#### make 编译模块

当完成了上述的`compilation`对象后，就开始从`Entry`入口文件开始读取，主要执行`_addModuleChain()`函数，如下：

```
_addModuleChain(context, dependency, onModule, callback) {
   ...
   // 根据依赖查找对应的工厂函数
   const Dep = /** @type {DepConstructor} */ (dependency.constructor);
   const moduleFactory = this.dependencyFactories.get(Dep);
   
   // 调用工厂函数NormalModuleFactory的create来生成一个空的NormalModule对象
   moduleFactory.create({
       dependencies: [dependency]
       ...
   }, (err, module) => {
       ...
       const afterBuild = () => {
        this.processModuleDependencies(module, err => {
         if (err) return callback(err);
         callback(null, module);
           });
    };
       
       this.buildModule(module, false, null, null, err => {
           ...
           afterBuild();
       })
   })
}
```

过程如下：

`_addModuleChain`中接收参数`dependency`传入的入口依赖，使用对应的工厂函数`NormalModuleFactory.create`方法生成一个空的`module`对象

回调中会把此`module`存入`compilation.modules`对象和`dependencies.module`对象中，由于是入口文件，也会存入`compilation.entries`中

随后执行`buildModule`进入真正的构建模块`module`内容的过程

#### build module 完成模块编译

这里主要调用配置的`loaders`，将我们的模块转成标准的`JS`模块

在用`Loader` 对一个模块转换完后，使用 `acorn` 解析转换后的内容，输出对应的抽象语法树（`AST`），以方便 `Webpack`后面对代码的分析

从配置的入口模块开始，分析其 `AST`，当遇到`require`等导入其它模块语句时，便将其加入到依赖的模块列表，同时对新找出的依赖模块递归分析，最终搞清所有模块的依赖关系

### 输出流程

#### seal 输出资源

`seal`方法主要是要生成`chunks`，对`chunks`进行一系列的优化操作，并生成要输出的代码

`webpack` 中的 `chunk` ，可以理解为配置在 `entry` 中的模块，或者是动态引入的模块

根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 `Chunk`，再把每个 `Chunk` 转换成一个单独的文件加入到输出列表

#### emit 输出完成

在确定好输出内容后，根据配置确定输出的路径和文件名

```
output: {
    path: path.resolve(__dirname, 'build'),
        filename: '[name].js'
}
```

在 `Compiler` 开始生成文件前，钩子 `emit` 会被执行，这是我们修改最终文件的最后一个机会

从而`webpack`整个打包过程则结束了

### 小结

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTZPrfr0rw0Mz6Nhq3OdRrXozCxRJ1joWsPMIfjF6o8mY9HZPqAKYa1l0nybIScd4RC9oN3PykNJg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

###  参考文献

- https://github.com/Cosen95/blog/issues/48
- https://developer.aliyun.com/article/61047

## 3、说说Webpack中常见的Loader？解决了什么问题？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS8Xjuhhh5piauYG5YbB9ugqhXGFNEmVU5SqSsxZ0JsGwdgC81JcZBa261BxSdfT8MHzZB8zHuHoYA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

`loader` 用于对模块的源代码进行转换，在 `import` 或"加载"模块时预处理文件

`webpack`做的事情，仅仅是分析出各种模块的依赖关系，然后形成资源列表，最终打包生成到指定的文件中。如下图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS8Xjuhhh5piauYG5YbB9ugq7yoXC3ibhY5CNIEtFLoRaIBNgrabiaVAQklfJA3AcR1zuBsXKYnnQUOg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在`webpack`内部中，任何文件都是模块，不仅仅只是`js`文件

默认情况下，在遇到`import`或者`load`加载模块的时候，`webpack`只支持对`js`文件打包

像`css`、`sass`、`png`等这些类型的文件的时候，`webpack`则无能为力，这时候就需要配置对应的`loader`进行文件内容的解析

在加载模块的时候，执行顺序如下：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS8Xjuhhh5piauYG5YbB9ugqrwlbJdWHs7fMpLJdYpX1KCEt7AcGiaBMzXU46y0UbxO56FWwrHXHBpA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

当 `webpack` 碰到不识别的模块的时候，`webpack` 会在配置的中查找该文件解析规则

关于配置`loader`的方式有三种：

- 配置方式（推荐）：在 webpack.config.js文件中指定 loader
- 内联方式：在每个 import 语句中显式指定 loader
- CLI 方式：在 shell 命令中指定它们

#### 配置方式

关于`loader`的配置，我们是写在`module.rules`属性中，属性介绍如下：

- `rules`是一个数组的形式，因此我们可以配置很多个`loader`
- 每一个`loader`对应一个对象的形式，对象属性`test` 为匹配的规则，一般情况为正则表达式
- 属性`use`针对匹配到文件类型，调用对应的 `loader` 进行处理

代码编写，如下形式：

```
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          },
          { loader: 'sass-loader' }
        ]
      }
    ]
  }
};
```

### 二、特性

这里继续拿上述代码，来讲讲`loader`的特性

从上述代码可以看到，在处理`css`模块的时候，`use`属性中配置了三个`loader`分别处理`css`文件

因为`loader`支持链式调用，链中的每个`loader`会处理之前已处理过的资源，最终变为`js`代码。顺序为相反的顺序执行，即上述执行方式为`sass-loader`、`css-loader`、`style-loader`

除此之外，`loader`的特性还有如下：

- loader 可以是同步的，也可以是异步的
- loader 运行在 Node.js 中，并且能够执行任何操作
- 除了常见的通过 `package.json` 的 `main` 来将一个 npm 模块导出为 loader，还可以在 module.rules 中使用 `loader` 字段直接引用一个模块
- 插件(plugin)可以为 loader 带来更多特性
- loader 能够产生额外的任意文件

可以通过 loader 的预处理函数，为 JavaScript 生态系统提供更多能力。用户现在可以更加灵活地引入细粒度逻辑，例如：压缩、打包、语言翻译和更多其他特性

### 三、常见的loader

在页面开发过程中，我们经常性加载除了`js`文件以外的内容，这时候我们就需要配置响应的`loader`进行加载

常见的`loader`如下：

- style-loader: 将css添加到DOM的内联样式标签style里
- css-loader :允许将css文件通过require的方式引入，并返回css代码
- less-loader: 处理less
- sass-loader: 处理sass
- postcss-loader: 用postcss来处理CSS
- autoprefixer-loader: 处理CSS3属性前缀，已被弃用，建议直接使用postcss
- file-loader: 分发文件到output目录并返回相对路径
- url-loader: 和file-loader类似，但是当文件小于设定的limit时可以返回一个Data Url
- html-minify-loader: 压缩HTML
- babel-loader :用babel来转换ES6文件到ES

下面给出一些常见的`loader`的使用：

#### css-loader

分析 `css` 模块之间的关系，并合成⼀个 `css`

```
npm install --save-dev css-loader
rules: [
  ...,
 {
  test: /\.css$/,
    use: {
      loader: "css-loader",
      options: {
     // 启用/禁用 url() 处理
     url: true,
     // 启用/禁用 @import 处理
     import: true,
        // 启用/禁用 Sourcemap
        sourceMap: false
      }
    }
 }
]
```

如果只通过`css-loader`加载文件，这时候页面代码设置的样式并没有生效

原因在于，`css-loader`只是负责将`.css`文件进行一个解析，而并不会将解析后的`css`插入到页面中

如果我们希望再完成插入`style`的操作，那么我们还需要另外一个`loader`，就是`style-loader`

#### style-loader

把 `css-loader` 生成的内容，用 `style` 标签挂载到页面的 `head` 中

```
npm install --save-dev style-loader
rules: [
  ...,
 {
  test: /\.css$/,
    use: ["style-loader", "css-loader"]
 }
]
```

同一个任务的 `loader` 可以同时挂载多个，处理顺序为：从右到左，从下往上

#### less-loader

开发中，我们也常常会使用`less`、`sass`、`stylus`预处理器编写`css`样式，使开发效率提高，这里需要使用`less-loader`

```
npm install less-loader -D
rules: [
  ...,
 {
  test: /\.css$/,
    use: ["style-loader", "css-loader","less-loader"]
 }
]
```

#### raw-loader

在 `webpack`中通过 `import`方式导入文件内容，该`loader`并不是内置的，所以首先要安装

```
npm install --save-dev raw-loader
```

然后在 webpack.config.js 中进行配置

```
module.exports = {
  ...,
  module: {
      rules: [
      {
        test: /\.(txt|md)$/,
        use: 'raw-loader'
     }
    ]
 }
}
```

#### file-loader

把识别出的资源模块，移动到指定的输出⽬目录，并且返回这个资源在输出目录的地址(字符串)

```
npm install --save-dev file-loader
rules: [
  ...,
 {
  test: /\.(png|jpe?g|gif)$/,
    use: {
      loader: "file-loader",
      options: {
        // placeholder 占位符 [name] 源资源模块的名称
        // [ext] 源资源模块的后缀
        name: "[name]_[hash].[ext]",
        //打包后的存放位置
        outputPath: "./images",
        // 打包后文件的 url
        publicPath: './images',
      }
    }
 }
]
```

#### url-loader

可以处理理 `file-loader` 所有的事情，但是遇到图片格式的模块，可以选择性的把图片转成 `base64` 格式的字符串，并打包到 `js` 中，对小体积的图片比较合适，大图片不合适。

```
npm install --save-dev url-loader
rules: [
  ...,
 {
  test: /\.(png|jpe?g|gif)$/,
    use: {
      loader: "url-loader",
      options: {
        // placeholder 占位符 [name] 源资源模块的名称
        // [ext] 源资源模块的后缀
        name: "[name]_[hash].[ext]",
        //打包后的存放位置
        outputPath: "./images"
        // 打包后文件的 url
        publicPath: './images',
        // 小于 100 字节转成 base64 格式
        limit: 100
      }
    }
 }
]
```

### 参考文献

- https://webpack.docschina.org/concepts/loaders/
- https://segmentfault.com/a/1190000018680530
- https://vue3js.cn/interview/

## 4、说说webpack中常见的Plugin？解决了什么问题？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQfxicUfGuYySiax3Sziar4T447syDzg7QnWPfeV9x03hPRNmcNeCletvJgqneZsbxyyQEF0dmwYcPQw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

`Plugin`（Plug-in）是一种计算机应用程序，它和主应用程序互相交互，以提供特定的功能

是一种遵循一定规范的应用程序接口编写出来的程序，只能运行在程序规定的系统下，因为其需要调用原纯净系统提供的函数库或者数据

`webpack`中的`plugin`也是如此，`plugin`赋予其各种灵活的功能，例如打包优化、资源管理、环境变量注入等，它们会运行在 `webpack` 的不同阶段（钩子 / 生命周期），贯穿了`webpack`整个编译周期

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQfxicUfGuYySiax3Sziar4T44GWBj3RTd8grYvITric8r1E87ib7Heojz1rDkJaViaJ72oBTRKamo6oNNw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

目的在于解决`loader` 无法实现的其他事

#### 配置方式

这里讲述文件的配置方式，一般情况，通过配置文件导出对象中`plugins`属性传入`new`实例对象。如下所示：

```
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 通过 npm 安装
const webpack = require('webpack'); // 访问内置的插件
module.exports = {
  ...
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({ template: './src/index.html' }),
  ],
};
```

### 二、特性

其本质是一个具有`apply`方法`javascript`对象

`apply` 方法会被 `webpack compiler`调用，并且在整个编译生命周期都可以访问 `compiler`对象

```
const pluginName = 'ConsoleLogOnBuildWebpackPlugin';

class ConsoleLogOnBuildWebpackPlugin {
  apply(compiler) {
    compiler.hooks.run.tap(pluginName, (compilation) => {
      console.log('webpack 构建过程开始！');
    });
  }
}

module.exports = ConsoleLogOnBuildWebpackPlugin;
```

`compiler hook` 的 `tap`方法的第一个参数，应是驼峰式命名的插件名称

关于整个编译生命周期钩子，有如下：

- entry-option ：初始化 option
- run
- compile：真正开始的编译，在创建 compilation 对象之前
- compilation ：生成好了 compilation 对象
- make 从 entry 开始递归分析依赖，准备对每个模块进行 build
- after-compile：编译 build 过程结束
- emit ：在将内存中 assets 内容写到磁盘文件夹之前
- after-emit ：在将内存中 assets 内容写到磁盘文件夹之后
- done：完成所有的编译过程
- failed：编译失败的时候

### 三、常见的Plugin

常见的`plugin`有如图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQfxicUfGuYySiax3Sziar4T44ccwicIYJaGALCInia789ARyh668syLTm9hrOW7EDpRgYsHE5RAYOnvhw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

下面介绍几个常用的插件用法：

#### HtmlWebpackPlugin

在打包结束后，⾃动生成⼀个 `html` ⽂文件，并把打包生成的`js` 模块引⼊到该 `html` 中

```
npm install --save-dev html-webpack-plugin
// webpack.config.js
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
 ...
  plugins: [
     new HtmlWebpackPlugin({
       title: "My App",
       filename: "app.html",
       template: "./src/html/index.html"
     }) 
  ]
};
<!--./src/html/index.html-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title><%=htmlWebpackPlugin.options.title%></title>
</head>
<body>
    <h1>html-webpack-plugin</h1>
</body>
</html>
```

在 `html` 模板中，可以通过 `<%=htmlWebpackPlugin.options.XXX%>` 的方式获取配置的值

更多的配置可以自寻查找

#### clean-webpack-plugin

删除（清理）构建目录

```
npm install --save-dev clean-webpack-plugin
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
module.exports = {
 ...
  plugins: [
    ...,
    new CleanWebpackPlugin(),
    ...
  ]
}
```

#### mini-css-extract-plugin

提取 `CSS` 到一个单独的文件中

```
npm install --save-dev mini-css-extract-plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
 ...,
  module: {
   rules: [
    {
     test: /\.s[ac]ss$/,
     use: [
      {
       loader: MiniCssExtractPlugin.loader
     },
          'css-loader',
          'sass-loader'
        ]
   }
   ]
 },
  plugins: [
    ...,
    new MiniCssExtractPlugin({
     filename: '[name].css'
    }),
    ...
  ]
}
```

#### DefinePlugin

允许在编译时创建配置的全局对象，是一个`webpack`内置的插件，不需要安装

```
const { DefinePlugun } = require('webpack')

module.exports = {
 ...
    plugins:[
        new DefinePlugin({
            BASE_URL:'"./"'
        })
    ]
}
```

这时候编译`template`模块的时候，就能通过下述形式获取全局对象

```
<link rel="icon" href="<%= BASE_URL%>favicon.ico>"
```

#### copy-webpack-plugin

复制文件或目录到执行区域，如`vue`的打包过程中，如果我们将一些文件放到`public`的目录下，那么这个目录会被复制到`dist`文件夹中

```
npm install copy-webpack-plugin -D
new CopyWebpackPlugin({
    parrerns:[
        {
            from:"public",
            globOptions:{
                ignore:[
                    '**/index.html'
                ]
            }
        }
    ]
})
```

复制的规则在`patterns`属性中设置：

- from：设置从哪一个源中开始复制
- to：复制到的位置，可以省略，会默认复制到打包的目录下
- globOptions：设置一些额外的选项，其中可以编写需要忽略的文件

### 参考文献

- https://webpack.docschina.org/concepts/plugins/
- https://baike.baidu.com/item/Plugin
- https://segmentfault.com/a/1190000018695134
- https://vue3js.cn/interview

## 5、说说Webpack中Loader和Plugin的区别？编写Loader，Plugin的思路？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRJtHcYdbquCZnkqhPtUPicE0AtyF9tX5GU4jSY2CGhI2WNsNVtHbb5qTq2Hrt2F6oodYpAZOjC05A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、区别

前面两节我们有提到`Loader`与`Plugin`对应的概念，先来回顾下

- loader 是文件加载器，能够加载资源文件，并对这些文件进行一些处理，诸如编译、压缩等，最终一起打包到指定的文件中
- plugin 赋予了 webpack 各种灵活的功能，例如打包优化、资源管理、环境变量注入等，目的是解决 loader 无法实现的其他事

从整个运行时机上来看，如下图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRJtHcYdbquCZnkqhPtUPicENxJ42cl5llntWnibv5125oDTxXpDMKn0q3kJjlywmjevEXo3G2BOHBw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

可以看到，两者在运行时机上的区别：

- loader 运行在打包文件之前
- plugins 在整个编译周期都起作用

在`Webpack` 运行的生命周期中会广播出许多事件，`Plugin` 可以监听这些事件，在合适的时机通过`Webpack`提供的 `API`改变输出结果

对于`loader`，实质是一个转换器，将A文件进行编译形成B文件，操作的是文件，比如将`A.scss`或`A.less`转变为`B.css`，单纯的文件转换过程

### 二、编写loader

在编写 `loader` 前，我们首先需要了解 `loader` 的本质

其本质为函数，函数中的 `this` 作为上下文会被 `webpack` 填充，因此我们不能将 `loader`设为一个箭头函数

函数接受一个参数，为 `webpack` 传递给 `loader` 的文件源内容

函数中 `this` 是由 `webpack` 提供的对象，能够获取当前 `loader` 所需要的各种信息

函数中有异步操作或同步操作，异步操作通过 `this.callback` 返回，返回值要求为 `string` 或者 `Buffer`

代码如下所示：

```
// 导出一个函数，source为webpack传递给loader的文件源内容
module.exports = function(source) {
    const content = doSomeThing2JsString(source);
    
    // 如果 loader 配置了 options 对象，那么this.query将指向 options
    const options = this.query;
    
    // 可以用作解析其他模块路径的上下文
    console.log('this.context');
    
    /*
     * this.callback 参数：
     * error：Error | null，当 loader 出错时向外抛出一个 error
     * content：String | Buffer，经过 loader 编译后需要导出的内容
     * sourceMap：为方便调试生成的编译后内容的 source map
     * ast：本次编译生成的 AST 静态语法树，之后执行的 loader 可以直接使用这个 AST，进而省去重复生成 AST 的过程
     */
    this.callback(null, content); // 异步
    return content; // 同步
}
```

一般在编写`loader`的过程中，保持功能单一，避免做多种功能

如`less`文件转换成 `css`文件也不是一步到位，而是 `less-loader`、`css-loader`、`style-loader`几个 `loader`的链式调用才能完成转换

### 三、编写plugin

由于`webpack`基于发布订阅模式，在运行的生命周期中会广播出许多事件，插件通过监听这些事件，就可以在特定的阶段执行自己的插件任务

在之前也了解过，`webpack`编译会创建两个核心对象：

- compiler：包含了 webpack 环境的所有的配置信息，包括 options，loader 和 plugin，和 webpack 整个生命周期相关的钩子
- compilation：作为 plugin 内置事件回调函数的参数，包含了当前的模块资源、编译生成资源、变化的文件以及被跟踪依赖的状态信息。当检测到一个文件变化，一次新的 Compilation 将被创建

如果自己要实现`plugin`，也需要遵循一定的规范：

- 插件必须是一个函数或者是一个包含 `apply` 方法的对象，这样才能访问`compiler`实例
- 传给每个插件的 `compiler` 和 `compilation` 对象都是同一个引用，因此不建议修改
- 异步的事件需要在插件处理完任务时调用回调函数通知 `Webpack` 进入下一个流程，不然会卡住

实现`plugin`的模板如下：

```
class MyPlugin {
    // Webpack 会调用 MyPlugin 实例的 apply 方法给插件实例传入 compiler 对象
  apply (compiler) {
    // 找到合适的事件钩子，实现自己的插件功能
    compiler.hooks.emit.tap('MyPlugin', compilation => {
        // compilation: 当前打包构建流程的上下文
        console.log(compilation);
        
        // do something...
    })
  }
}
```

在 `emit` 事件发生时，代表源文件的转换和组装已经完成，可以读取到最终将输出的资源、代码块、模块及其依赖，并且可以修改输出资源的内容

### 参考文献

- https://webpack.docschina.org/api/loaders/
- https://webpack.docschina.org/api/compiler-hooks/
- https://segmentfault.com/a/1190000039877943
- https://vue3js.cn/interview

## 6、说说Webpack的热更新是如何做到的？原理是什么？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQOqf8ia3haGPMK3tUKmlS8ZDs6yib4n2FtHCbmL8HjG4e0uMjiaMsYvMTIcH7jZo6uTJPOvs9G7zGXw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

`HMR`全称 `Hot Module Replacement`，可以理解为模块热替换，指在应用程序运行过程中，替换、添加、删除模块，而无需重新刷新整个应用

例如，我们在应用运行过程中修改了某个模块，通过自动刷新会导致整个应用的整体刷新，那页面中的状态信息都会丢失

如果使用的是 `HMR`，就可以实现只将修改的模块实时替换至应用中，不必完全刷新整个应用

在`webpack`中配置开启热模块也非常的简单，如下代码：

```
const webpack = require('webpack')
module.exports = {
  // ...
  devServer: {
    // 开启 HMR 特性
    hot: true
    // hotOnly: true
  }
}
```

通过上述这种配置，如果我们修改并保存`css`文件，确实能够以不刷新的形式更新到页面中

但是，当我们修改并保存`js`文件之后，页面依旧自动刷新了，这里并没有触发热模块

所以，`HMR`并不像 `Webpack` 的其他特性一样可以开箱即用，需要有一些额外的操作

我们需要去指定哪些模块发生更新时进行`HRM`，如下代码：

```
if(module.hot){
    module.hot.accept('./util.js',()=>{
        console.log("util.js更新了")
    })
}
```

### 二、实现原理

首先来看看一张图，如下：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQOqf8ia3haGPMK3tUKmlS8ZSDlXjGKdOot13ekiciclzG9vBEev0y6odaMWaQJn2dpr3GnjKDQOBRCw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

- Webpack Compile：将 JS 源代码编译成 bundle.js
- HMR Server：用来将热更新的文件输出给 HMR Runtime
- Bundle Server：静态资源文件服务器，提供文件访问路径
- HMR Runtime：socket服务器，会被注入到浏览器，更新文件的变化
- bundle.js：构建输出的文件
- 在HMR Runtime 和 HMR Server之间建立 websocket，即图上4号线，用于实时更新文件变化

上面图中，可以分成两个阶段：

- 启动阶段为上图 1 - 2 - A - B

在编写未经过`webpack`打包的源代码后，`Webpack Compile` 将源代码和 `HMR Runtime` 一起编译成 `bundle`文件，传输给`Bundle Server` 静态资源服务器

- 更新阶段为上图 1 - 2 - 3 - 4

当某一个文件或者模块发生变化时，`webpack`监听到文件变化对文件重新编译打包，编译生成唯一的`hash`值，这个`hash`值用来作为下一次热更新的标识

根据变化的内容生成两个补丁文件：`manifest`（包含了 `hash` 和 `chundId`，用来说明变化的内容）和`chunk.js` 模块

由于`socket`服务器在`HMR Runtime` 和 `HMR Server`之间建立 `websocket`链接，当文件发生改动的时候，服务端会向浏览器推送一条消息，消息包含文件改动后生成的`hash`值，如下图的`h`属性，作为下一次热更新的标识

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQOqf8ia3haGPMK3tUKmlS8ZYexoqQRWgnNdRIyRW4mNCtK3s2cvQcERQzBpMOu1uXxuCe4Pia8ZEicw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在浏览器接受到这条消息之前，浏览器已经在上一次`socket` 消息中已经记住了此时的`hash` 标识，这时候我们会创建一个 `ajax` 去服务端请求获取到变化内容的 `manifest` 文件

`mainfest`文件包含重新`build`生成的`hash`值，以及变化的模块，对应上图的`c`属性

浏览器根据 `manifest` 文件获取模块变化的内容，从而触发`render`流程，实现局部模块更新

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQOqf8ia3haGPMK3tUKmlS8ZZwaZ6UuIaopRicvmLlicyRYqUFzRV1ca8KygK0lkM7Ediaeich7vd8ndaw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 三、总结

关于`webpack`热模块更新的总结如下：

- 通过`webpack-dev-server`创建两个服务器：提供静态资源的服务（express）和Socket服务
- express server 负责直接提供静态资源的服务（打包后的资源直接被浏览器请求和解析）
- socket server 是一个 websocket 的长连接，双方可以通信
- 当 socket server 监听到对应的模块发生变化时，会生成两个文件.json（manifest文件）和.js文件（update chunk）
- 通过长连接，socket server 可以直接将这两个文件主动发送给客户端（浏览器）
- 浏览器拿到两个新的文件后，通过HMR runtime机制，加载这两个文件，并且针对修改的模块进行更新

### 参考文献

- https://zhuanlan.zhihu.com/p/138446061
- https://github.com/Jocs/jocs.github.io/issues/15
- https://juejin.cn/post/6844904134697549832
- https://vue3js.cn/interview/

## 7、说说Webpack Proxy工作原理？为什么能解决跨域?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQY0m3clTWD2auumJUjq6IgMNAEZa0YJweQ1w8oj2JMf2n7GuHys0vxPXtiaY2oF5Z6MBXTUUMB4kg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

`webpack proxy`，即`webpack`提供的代理服务

基本行为就是接收客户端发送的请求后转发给其他服务器

其目的是为了便于开发者在开发模式下解决跨域问题（浏览器安全策略限制）

想要实现代理首先需要一个中间服务器，`webpack`中提供服务器的工具为`webpack-dev-server`

#### webpack-dev-server

`webpack-dev-server`是 `webpack` 官方推出的一款开发工具，将自动编译和自动刷新浏览器等一系列对开发友好的功能全部集成在了一起

目的是为了提高开发者日常的开发效率，「只适用在开发阶段」

关于配置方面，在`webpack`配置对象属性中通过`devServer`属性提供，如下：

```
// ./webpack.config.js
const path = require('path')

module.exports = {
    // ...
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000,
        proxy: {
            '/api': {
                target: 'https://api.github.com'
            }
        }
        // ...
    }
}
```

`devServetr`里面`proxy`则是关于代理的配置，该属性为对象的形式，对象中每一个属性就是一个代理的规则匹配

属性的名称是需要被代理的请求路径前缀，一般为了辨别都会设置前缀为`/api`，值为对应的代理匹配规则，对应如下：

- target：表示的是代理到的目标地址
- pathRewrite：默认情况下，我们的 /api-hy 也会被写入到URL中，如果希望删除，可以使用pathRewrite
- secure：默认情况下不接收转发到https的服务器上，如果希望支持，可以设置为false
- changeOrigin：它表示是否更新代理后请求的 headers 中host地址

### 二、工作原理

`proxy`工作原理实质上是利用`http-proxy-middleware` 这个`http`代理中间件，实现请求转发给其他服务器

举个例子：

在开发阶段，本地地址为`http://localhost:3000`，该浏览器发送一个前缀带有`/api`标识的请求到服务端获取数据，但响应这个请求的服务器只是将请求转发到另一台服务器中

```
const express = require('express');
const proxy = require('http-proxy-middleware');

const app = express();

app.use('/api', proxy({target: 'http://www.example.org', changeOrigin: true}));
app.listen(3000);

// http://localhost:3000/api/foo/bar -> http://www.example.org/api/foo/bar
```

### 三、跨域

在开发阶段， `webpack-dev-server` 会启动一个本地开发服务器，所以我们的应用在开发阶段是独立运行在 `localhost`的一个端口上，而后端服务又是运行在另外一个地址上

所以在开发阶段中，由于浏览器同源策略的原因，当本地访问后端就会出现跨域请求的问题

通过设置`webpack proxy`实现代理请求后，相当于浏览器与服务端中添加一个代理者

当本地发送请求的时候，代理服务器响应该请求，并将请求转发到目标服务器，目标服务器响应数据后再将数据返回给代理服务器，最终再由代理服务器将数据响应给本地

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQY0m3clTWD2auumJUjq6IgwVBmRVGvkSBuwGo3epmB8fDiam9EwFo8BCElBTCnM6EUYp1wcfjMAPg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在代理服务器传递数据给本地浏览器的过程中，两者同源，并不存在跨域行为，这时候浏览器就能正常接收数据

注意：「服务器与服务器之间请求数据并不会存在跨域行为，跨域行为是浏览器安全策略限制」

### 参考文献

- https://webpack.docschina.org/configuration/dev-server/#devserverproxy

## 8、说说你是如何利用Webpack来优化前端性能的？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS4vLTKjYFjCkqQ08Fo929ImVicIzNic0Jkh8pCL7QtF02SZonCW2RBYoem7OrUBEuYhYRuU3t9XIZQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、背景

随着前端的项目逐渐扩大，必然会带来的一个问题就是性能

尤其在大型复杂的项目中，前端业务可能因为一个小小的数据依赖，导致整个页面卡顿甚至奔溃

一般项目在完成后，会通过`webpack`进行打包，利用`webpack`对前端项目性能优化是一个十分重要的环节

### 二、如何优化

通过`webpack`优化前端的手段有：

- JS代码压缩
- CSS代码压缩
- Html文件代码压缩
- 文件大小压缩
- 图片压缩
- Tree Shaking
- 代码分离
- 内联 chunk

#### JS代码压缩

`terser`是一个`JavaScript`的解释、绞肉机、压缩机的工具集，可以帮助我们压缩、丑化我们的代码，让`bundle`更小

在`production`模式下，`webpack` 默认就是使用 `TerserPlugin` 来处理我们的代码的。如果想要自定义配置它，配置方法如下：

```
const TerserPlugin = require('terser-webpack-plugin')
module.exports = {
    ...
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                parallel: true // 电脑cpu核数-1
            })
        ]
    }
}
```

属性介绍如下：

- extractComments：默认值为true，表示会将注释抽取到一个单独的文件中，开发阶段，我们可设置为 false ，不保留注释
- parallel：使用多进程并发运行提高构建的速度，默认值是true，并发运行的默认数量：os.cpus().length - 1
- terserOptions：设置我们的terser相关的配置：
- compress：设置压缩相关的选项，mangle：设置丑化相关的选项，可以直接设置为true
- mangle：设置丑化相关的选项，可以直接设置为true
- toplevel：底层变量是否进行转换
- keep_classnames：保留类的名称
- keep_fnames：保留函数的名称

#### CSS代码压缩

`CSS`压缩通常是去除无用的空格等，因为很难去修改选择器、属性的名称、值等

CSS的压缩我们可以使用另外一个插件：`css-minimizer-webpack-plugin`

```
npm install css-minimizer-webpack-plugin -D
```

配置方法如下：

```
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
module.exports = {
    // ...
    optimization: {
        minimize: true,
        minimizer: [
            new CssMinimizerPlugin({
                parallel: true
            })
        ]
    }
}
```

#### Html文件代码压缩

使用`HtmlWebpackPlugin`插件来生成`HTML`的模板时候，通过配置属性`minify`进行`html`优化

```
module.exports = {
    ...
    plugin:[
        new HtmlwebpackPlugin({
            ...
            minify:{
                minifyCSS:false, // 是否压缩css
                collapseWhitespace:false, // 是否折叠空格
                removeComments:true // 是否移除注释
            }
        })
    ]
}
```

设置了`minify`，实际会使用另一个插件`html-minifier-terser`

#### 文件大小压缩

对文件的大小进行压缩，减少`http`传输过程中宽带的损耗

```
npm install compression-webpack-plugin -D
new ComepressionPlugin({
    test:/\.(css|js)$/,  // 哪些文件需要压缩
    threshold:500, // 设置文件多大开始压缩
    minRatio:0.7, // 至少压缩的比例
    algorithm:"gzip", // 采用的压缩算法
})
```

#### 图片压缩

一般来说在打包之后，一些图片文件的大小是远远要比 `js` 或者 `css` 文件要来的大，所以图片压缩较为重要

配置方法如下：

```
module: {
  rules: [
    {
      test: /\.(png|jpg|gif)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name]_[hash].[ext]',
            outputPath: 'images/',
          }
        },
        {
          loader: 'image-webpack-loader',
          options: {
            // 压缩 jpeg 的配置
            mozjpeg: {
              progressive: true,
              quality: 65
            },
            // 使用 imagemin**-optipng 压缩 png，enable: false 为关闭
            optipng: {
              enabled: false,
            },
            // 使用 imagemin-pngquant 压缩 png
            pngquant: {
              quality: '65-90',
              speed: 4
            },
            // 压缩 gif 的配置
            gifsicle: {
              interlaced: false,
            },
            // 开启 webp，会把 jpg 和 png 图片压缩为 webp 格式
            webp: {
              quality: 75
            }
          }
        }
      ]
    },
  ]
} 
```

#### Tree Shaking

`Tree Shaking` 是一个术语，在计算机中表示消除死代码，依赖于`ES Module`的静态语法分析（不执行任何的代码，可以明确知道模块的依赖关系）

在`webpack`实现`Trss shaking`有两种不同的方案：

- usedExports：通过标记某些函数是否被使用，之后通过Terser来进行优化的
- sideEffects：跳过整个模块/文件，直接查看该文件是否有副作用

两种不同的配置方案， 有不同的效果

##### usedExports

配置方法也很简单，只需要将`usedExports`设为`true`

```
module.exports = {
    ...
    optimization:{
        usedExports
    }
}
```

使用之后，没被用上的代码在`webpack`打包中会加入`unused harmony export mul`注释，用来告知 `Terser` 在优化时，可以删除掉这段代码

如下面`sum`函数没被用到，`webpack`打包会添加注释，`terser`在优化时，则将该函数去掉

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS4vLTKjYFjCkqQ08Fo929IOA49uCVs2FtBwsjib2dybru6vU2EMgrDDX242icJEymWYTnII0bvVVYQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

##### sideEffects

`sideEffects`用于告知`webpack compiler`哪些模块时有副作用，配置方法是在`package.json`中设置`sideEffects`属性

如果`sideEffects`设置为false，就是告知`webpack`可以安全的删除未用到的`exports`

如果有些文件需要保留，可以设置为数组的形式

```
"sideEffecis":[
    "./src/util/format.js",
    "*.css" // 所有的css文件
]
```

上述都是关于`javascript`的`tree shaking`，`css`同样也能够实现`tree shaking`

##### css tree shaking

`css`进行`tree shaking`优化可以安装`PurgeCss`插件

```
npm install purgecss-plugin-webpack -D
const PurgeCssPlugin = require('purgecss-webpack-plugin')
module.exports = {
    ...
    plugins:[
        new PurgeCssPlugin({
            path:glob.sync(`${path.resolve('./src')}/**/*`), {nodir:true}// src里面的所有文件
            satelist:function(){
                return {
                    standard:["html"]
                }
            }
        })
    ]
}
```

- paths：表示要检测哪些目录下的内容需要被分析，配合使用glob
- 默认情况下，Purgecss会将我们的html标签的样式移除掉，如果我们希望保留，可以添加一个safelist的属性

#### 代码分离

将代码分离到不同的`bundle`中，之后我们可以按需加载，或者并行加载这些文件

默认情况下，所有的`JavaScript`代码（业务代码、第三方依赖、暂时没有用到的模块）在首页全部都加载，就会影响首页的加载速度

代码分离可以分出出更小的`bundle`，以及控制资源加载优先级，提供代码的加载性能

这里通过`splitChunksPlugin`来实现，该插件`webpack`已经默认安装和集成，只需要配置即可

默认配置中，chunks仅仅针对于异步（async）请求，我们可以设置为initial或者all

```
module.exports = {
    ...
    optimization:{
        splitChunks:{
            chunks:"all"
        }
    }
}
```

`splitChunks`主要属性有如下：

- Chunks，对同步代码还是异步代码进行处理
- minSize：拆分包的大小, 至少为minSize，如何包的大小不超过minSize，这个包不会拆分
- maxSize：将大于maxSize的包，拆分为不小于minSize的包
- minChunks：被引入的次数，默认是1

#### 内联chunk

可以通过`InlineChunkHtmlPlugin`插件将一些`chunk`的模块内联到`html`，如`runtime`的代码（对模块进行解析、加载、模块信息相关的代码），代码量并不大，但是必须加载的

```
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    ...
    plugin:[
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin,[/runtime.+\.js/]
}
```

### 三、总结

关于`webpack`对前端性能的优化，可以通过文件体积大小入手，其次还可通过分包的形式、减少http请求次数等方式，实现对前端性能的优化

### 参考文献

- https://zhuanlan.zhihu.com/p/139498741
- https://vue3js.cn/interview/

## 9、说说提高webpack的构建速度的手段有哪些？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSoI6FCtsF6SziaHgoXmNoJWTHqqKytjUe0X44iauKe56TYdv5FSpoX8OApqL908q9MlhC6hCYgib1Ng/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、背景

随着我们的项目涉及到页面越来越多，功能和业务代码也会随着越多，相应的 `webpack` 的构建时间也会越来越久

构建时间与我们日常开发效率密切相关，当我们本地开发启动 `devServer` 或者 `build` 的时候，如果时间过长，会大大降低我们的工作效率

所以，优化`webpack` 构建速度是十分重要的环节

### 二、如何优化

常见的提升构建速度的手段有如下：

- 优化 loader 配置
- 合理使用 resolve.extensions
- 优化 resolve.modules
- 优化 resolve.alias
- 使用 DLLPlugin 插件
- 使用 cache-loader
- terser 启动多线程
- 合理使用 sourceMap

#### 优化loader配置

在使用`loader`时，可以通过配置`include`、`exclude`、`test`属性来匹配文件，接触`include`、`exclude`规定哪些匹配应用`loader`

如采用 ES6 的项目为例，在配置 `babel-loader`时，可以这样：

```
module.exports = {
  module: {
    rules: [
      {
        // 如果项目源码中只有 js 文件就不要写成 /\.jsx?$/，提升正则表达式性能
        test: /\.js$/,
        // babel-loader 支持缓存转换出的结果，通过 cacheDirectory 选项开启
        use: ['babel-loader?cacheDirectory'],
        // 只对项目根目录下的 src 目录中的文件采用 babel-loader
        include: path.resolve(__dirname, 'src'),
      },
    ]
  },
};
```

#### 合理使用 resolve.extensions

在开发中我们会有各种各样的模块依赖，这些模块可能来自于自己编写的代码，也可能来自第三方库， `resolve`可以帮助`webpack`从每个 `require/import` 语句中，找到需要引入到合适的模块代码

通过`resolve.extensions`是解析到文件时自动添加拓展名，默认情况如下：

```
module.exports = {
    ...
    extensions:[".warm",".mjs",".js",".json"]
}
```

当我们引入文件的时候，若没有文件后缀名，则会根据数组内的值依次查找

当我们配置的时候，则不要随便把所有后缀都写在里面，这会调用多次文件的查找，这样就会减慢打包速度

#### 优化 resolve.modules

`resolve.modules` 用于配置 `webpack` 去哪些目录下寻找第三方模块。默认值为`['node_modules']`，所以默认会从`node_modules`中查找文件 当安装的第三方模块都放在项目根目录下的 `./node_modules`目录下时，所以可以指明存放第三方模块的绝对路径，以减少寻找，配置如下：

```
module.exports = {
  resolve: {
    // 使用绝对路径指明第三方模块存放的位置，以减少搜索步骤
    // 其中 __dirname 表示当前工作目录，也就是项目根目录
    modules: [path.resolve(__dirname, 'node_modules')]
  },
};
```

#### 优化 resolve.alias

`alias`给一些常用的路径起一个别名，特别当我们的项目目录结构比较深的时候，一个文件的路径可能是`./../../`的形式

通过配置`alias`以减少查找过程

```
module.exports = {
    ...
    resolve:{
        alias:{
            "@":path.resolve(__dirname,'./src')
        }
    }
}
```

#### 使用 DLLPlugin 插件

`DLL`全称是 动态链接库，是为软件在winodw中实现共享函数库的一种实现方式，而Webpack也内置了DLL的功能，为的就是可以共享，不经常改变的代码，抽成一个共享的库。这个库在之后的编译过程中，会被引入到其他项目的代码中

使用步骤分成两部分：

- 打包一个 DLL 库
- 引入 DLL 库

##### 打包一个 DLL 库

`webpack`内置了一个`DllPlugin`可以帮助我们打包一个DLL的库文件

```
module.exports = {
    ...
    plugins:[
        new webpack.DllPlugin({
            name:'dll_[name]',
            path:path.resolve(__dirname,"./dll/[name].mainfest.json")
        })
    ]
}
```

##### 引入 DLL 库

使用 `webpack` 自带的 `DllReferencePlugin` 插件对 `mainfest.json` 映射文件进行分析，获取要使用的`DLL`库

然后再通过`AddAssetHtmlPlugin`插件，将我们打包的`DLL`库引入到`Html`模块中

```
module.exports = {
    ...
    new webpack.DllReferencePlugin({
        context:path.resolve(__dirname,"./dll/dll_react.js"),
        mainfest:path.resolve(__dirname,"./dll/react.mainfest.json")
    }),
    new AddAssetHtmlPlugin({
        outputPath:"./auto",
        filepath:path.resolve(__dirname,"./dll/dll_react.js")
    })
}
```

#### 使用 cache-loader

在一些性能开销较大的 `loader`之前添加 `cache-loader`，以将结果缓存到磁盘里，显著提升二次构建速度

保存和读取这些缓存文件会有一些时间开销，所以请只对性能开销较大的 `loader` 使用此`loader`

```
module.exports = {
    module: {
        rules: [
            {
                test: /\.ext$/,
                use: ['cache-loader', ...loaders],
                include: path.resolve('src'),
            },
        ],
    },
};
```

#### terser 启动多线程

使用多进程并行运行来提高构建速度

```
module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
    ],
  },
};
```

#### 合理使用 sourceMap

打包生成  `sourceMap` 的时候，如果信息越详细，打包速度就会越慢。对应属性取值如下所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSoI6FCtsF6SziaHgoXmNoJWMe5nRClcCXugv8nGP1wfjMgia2rc2libVx74kOYnS2g6IK7IdSSTTW6A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 三、总结

可以看到，优化`webpack`构建的方式有很多，主要可以从优化搜索时间、缩小文件搜索范围、减少不必要的编译等方面入手

### 参考文献

- https://github.com/ly2011/blog/issues/44
- https://xie.infoq.cn/article/541418eb82a674741a0ad8865
- https://zhuanlan.zhihu.com/p/139498741
- https://vue3js.cn/interview

## 10、与Webpack类似的工具还有哪些？区别？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSp5L5l3omqclCLN32IwOoy0AWh5FDuXnJHkGx8z92Z9V9zNg9PUicAnicicoZAznloZBYfLn8nsALibg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、模块化工具

模块化是一种处理复杂系统分解为更好的可管理模块的方式

可以用来分割，组织和打包应用。每个模块完成一个特定的子功能，所有的模块按某种方法组装起来，成为一个整体(`bundle`)

在前端领域中，并非只有`webpack`这一款优秀的模块打包工具，还有其他类似的工具，例如`Rollup`、`Parcel`、`snowpack`，以及最近风头无两的`Vite`

通过这些模块打包工具，能够提高我们的开发效率，减少开发成本

这里没有提及`gulp`、`grunt`是因为它们只是定义为构建工具，不能类比

#### Rollup

`Rollup` 是一款 `ES Modules` 打包器，从作用上来看，`Rollup` 与 `Webpack` 非常类似。不过相比于 `Webpack`，`Rollup`要小巧的多

现在很多我们熟知的库都都使用它进行打包，比如：`Vue`、`React`和`three.js`等

举个例子：

```
// ./src/messages.js
export default {
  hi: 'Hey Guys, I am zce~'
}

// ./src/logger.js
export const log = msg => {
  console.log('---------- INFO ----------')
  console.log(msg)
  console.log('--------------------------')
}

export const error = msg => {
  console.error('---------- ERROR ----------')
  console.error(msg)
  console.error('---------------------------')
}

// ./src/index.js
import { log } from './logger'
import messages from './messages'
log(messages.hi)
```

然后通过`rollup`进行打包

```
$ npx rollup ./src/index.js --file ./dist/bundle.js
```

打包结果如下图![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSp5L5l3omqclCLN32IwOoye5SlXD0N4vhUoXEAynxic3XFNicU0U6SdztGCVA29s2r5HONTujdrkow/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

可以看到，代码非常简洁，完成不像`webpack`那样存在大量引导代码和模块函数

并且`error`方法由于没有被使用，输出的结果中并无`error`方法，可以看到，`rollup`默认开始`Tree-shaking` 优化输出结果

因此，可以看到`Rollup`的优点：

- 代码效率更简洁、效率更高
- 默认支持 Tree-shaking

但缺点也十分明显，加载其他类型的资源文件或者支持导入 `CommonJS` 模块，又或是编译 `ES` 新特性，这些额外的需求 `Rollup`需要使用插件去完成

综合来看，`rollup`并不适合开发应用使用，因为需要使用第三方模块，而目前第三方模块大多数使用`CommonJs`方式导出成员，并且`rollup`不支持`HMR`，使开发效率降低

但是在用于打包`JavaScript` 库时，`rollup`比 `webpack` 更有优势，因为其打包出来的代码更小、更快，其存在的缺点可以忽略

#### Parcel

Parcel ，是一款完全零配置的前端打包器，它提供了 “傻瓜式” 的使用体验，只需了解简单的命令，就能构建前端应用程序

`Parcel` 跟 `Webpack` 一样都支持以任意类型文件作为打包入口，但建议使用`HTML`文件作为入口，该`HTML`文件像平时一样正常编写代码、引用资源。如下所示：

```
<!-- ./src/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Parcel Tutorials</title>
</head>
<body>
  <script src="main.js"></script>
</body>
</html>
```

main.js文件通过`ES Moudle`方法导入其他模块成员

```
// ./src/main.js
import { log } from './logger'
log('hello parcel')
// ./src/logger.js
export const log = msg => {
  console.log('---------- INFO ----------')
  console.log(msg)
}
```

运行之后，使用命令打包

```
npx parcel src/index.html
```

执行命令后，`Parcel`不仅打包了应用，同时也启动了一个开发服务器，跟`webpack Dev Server`一样

跟`webpack`类似，也支持模块热替换，但用法更简单

同时，`Parcel`有个十分好用的功能：支持自动安装依赖，像`webpack`开发阶段突然使用安装某个第三方依赖，必然会终止`dev server`然后安装再启动。而`Parcel`则免了这繁琐的工作流程

同时，`Parcel`能够零配置加载其他类型的资源文件，无须像`webpack`那样配置对应的`loader`

打包命令如下：

```
npx parcel src/index.html
```

由于打包过程是多进程同时工作，构建速度会比`Webpack` 快，输出文件也会被压缩，并且样式代码也会被单独提取到单个文件中

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSp5L5l3omqclCLN32IwOoy1kHqByR2l3tJCW6rxrzmwSSOxiba7oZOT7E5HAicQoXKLvOzjnuVOegg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

可以感受到，`Parcel`给开发者一种很大的自由度，只管去实现业务代码，其他事情用`Parcel`解决

#### Snowpack

Snowpack，是一种闪电般快速的前端构建工具，专为现代`Web`设计，较复杂的打包工具（如`Webpack`或`Parcel`）的替代方案，利用`JavaScript`的本机模块系统，避免不必要的工作并保持流畅的开发体验

开发阶段，每次保存单个文件时，`Webpack`和`Parcel`都需要重新构建和重新打包应用程序的整个`bundle`。而`Snowpack`为你的应用程序每个文件构建一次，就可以永久缓存，文件更改时，`Snowpack`会重新构建该单个文件

下图给出`webpack`与`snowpack`打包区别：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSp5L5l3omqclCLN32IwOoyrFyaJhiaNN9WWUte6za2Is6jZ6vQvDvIXZzpfZ5AmKZAFvYECRpPuzA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在重新构建每次变更时没有任何的时间浪费，只需要在浏览器中进行HMR更新

#### Vite

vite ，是一种新型前端构建工具，能够显著提升前端开发体验

它主要由两部分组成：

- 一个开发服务器，它基于 原生 ES 模块 提供了丰富的内建功能，如速度快到惊人的 [模块热更新HMR
- 一套构建指令，它使用 Rollup打包你的代码，并且它是预配置的，可以输出用于生产环境的优化过的静态资源

其作用类似`webpack`+ `webpack-dev-server`，其特点如下：

- 快速的冷启动
- 即时的模块热更新
- 真正的按需编译

`vite`会直接启动开发服务器，不需要进行打包操作，也就意味着不需要分析模块的依赖、不需要编译，因此启动速度非常快

利用现代浏览器支持`ES Module`的特性，当浏览器请求某个模块的时候，再根据需要对模块的内容进行编译，这种方式大大缩短了编译时间

原理图如下所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSp5L5l3omqclCLN32IwOoy4qjpW2H0pJGtIwWvDXJkxybkB5U1DpjeyvV1FN2xIMDgMAiaj7ZYibibg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在热模块`HMR`方面，当修改一个模块的时候，仅需让浏览器重新请求该模块即可，无须像`webpack`那样需要把该模块的相关依赖模块全部编译一次，效率更高

#### webpack

相比上述的模块化工具，`webpack`大而全，很多常用的功能做到开箱即用。有两大最核心的特点：「一切皆模块」和「按需加载」

与其他构建工具相比，有如下优势：

- 智能解析：对 CommonJS 、 AMD 、ES6 的语法做了兼容
- 万物模块：对 js、css、图片等资源文件都支持打包
- 开箱即用：HRM、Tree-shaking等功能
- 代码分割：可以将代码切割成不同的 chunk，实现按需加载，降低了初始化时间
- 插件系统，具有强大的 Plugin 接口，具有更好的灵活性和扩展性
- 易于调试：支持 SourceUrls 和 SourceMaps
- 快速运行：webpack 使用异步 IO 并具有多级缓存，这使得 webpack 很快且在增量编译上更加快
- 生态环境好：社区更丰富，出现的问题更容易解决

### 参考文献

- https://zhuanlan.zhihu.com/p/95684686
- https://cn.vitejs.dev/guide/
- https://segmentfault.com/a/1190000039370642

# 三、node

## 1、说说你对Node.js 的理解？优缺点？应用场景？







# 四、网络

## 1、什么是HTTP? HTTP 和 HTTPS 的区别?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRKsW0ia6iar3HeMebYUia4KYZ79oUOqvhZdWz6hwnow64IW6EnNvVoFUxtEcOr7ibWT5W0qLnKE5F0Hg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、HTTP

`HTTP` (HyperText Transfer Protocol)，即超文本运输协议，是实现网络通信的一种规范

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRKsW0ia6iar3HeMebYUia4KYZvsVcaHEd7XgBwnMibnRAjXMHFqRrpxR688nbPN12QmTvlBmrkVyymPg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在计算机和网络世界有，存在不同的协议，如广播协议、寻址协议、路由协议等等......

而`HTTP`是一个传输协议，即将数据由A传到B或将B传输到A，并且 A 与 B 之间能够存放很多第三方，如：A<=>X<=>Y<=>Z<=>B

传输的数据并不是计算机底层中的二进制包，而是完整的、有意义的数据，如HTML 文件, 图片文件, 查询结果等超文本，能够被上层应用识别

在实际应用中，`HTTP`常被用于在`Web`浏览器和网站服务器之间传递信息，以明文方式发送内容，不提供任何方式的数据加密

特点如下：

- 支持客户/服务器模式
- 简单快速：客户向服务器请求服务时，只需传送请求方法和路径。由于HTTP协议简单，使得HTTP服务器的程序规模小，因而通信速度很快
- 灵活：HTTP允许传输任意类型的数据对象。正在传输的类型由Content-Type加以标记
- 无连接：无连接的含义是限制每次连接只处理一个请求。服务器处理完客户的请求，并收到客户的应答后，即断开连接。采用这种方式可以节省传输时间
- 无状态：HTTP协议无法根据之前的状态进行本次的请求处理

### 二、HTTPS

#### HTTPS的工作原理

在上述介绍`HTTP`中，了解到`HTTP`传递信息是以明文的形式发送内容，这并不安全。而`HTTPS`出现正是为了解决`HTTP`不安全的特性

为了保证这些隐私数据能加密传输，让`HTTP`运行安全的`SSL/TLS`协议上，即 HTTPS = HTTP + SSL/TLS，通过 `SSL`证书来验证服务器的身份，并为浏览器和服务器之间的通信进行加密

`SSL` 协议位于`TCP/IP` 协议与各种应用层协议之间，浏览器和服务器在使用 `SSL` 建立连接时需要选择一组恰当的加密算法来实现安全通信，为数据通讯提供安全支持

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRKsW0ia6iar3HeMebYUia4KYZAD6nmwvjt8mF3m0oxxcxTkAChWPXZZUollPVYEGgu4yaDOFwH3zoQA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

流程图如下所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRKsW0ia6iar3HeMebYUia4KYZP8jQRMKEBdVQWZAQGnrbqysNicGu5ZwlVQ2hXRmFhGK0rfFD0crZq5A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

- 首先客户端通过URL访问服务器建立SSL连接
- 服务端收到客户端请求后，会将网站支持的证书信息（证书中包含公钥）传送一份给客户端
- 客户端的服务器开始协商SSL连接的安全等级，也就是信息加密的等级
- 客户端的浏览器根据双方同意的安全等级，建立会话密钥，然后利用网站的公钥将会话密钥加密，并传送给网站
- 服务器利用自己的私钥解密出会话密钥
- 服务器利用会话密钥加密与客户端之间的通信

#### HTTPS的优缺点

**HTTPS的优点**：

　　尽管HTTPS并非绝对安全，掌握根证书的机构、掌握加密算法的组织同样可以进行中间人形式的攻击，但HTTPS仍是现行架构下最安全的解决方案，主要有以下几个好处：

　　（1）使用HTTPS协议可认证用户和服务器，确保数据发送到正确的客户机和服务器；

　　（2）HTTPS协议是由SSL+HTTP协议构建的可进行加密传输、身份认证的网络协议，要比http协议安全，可防止数据在传输过程中不被窃取、改变，确保数据的完整性。

　　（3）HTTPS是现行架构下最安全的解决方案，虽然不是绝对安全，但它大幅增加了中间人攻击的成本。

　　（4）谷歌曾在2014年8月份调整搜索引擎算法，并称“比起同等HTTP网站，采用HTTPS加密的网站在搜索结果中的排名将会更高”。

**HTTPS的缺点**：

　　虽然说HTTPS有很大的优势，但其相对来说，还是存在不足之处的：

　　（1）HTTPS协议握手阶段比较费时，会使页面的加载时间延长近50%，增加10%到20%的耗电；

　　（2）HTTPS连接缓存不如HTTP高效，会增加数据开销和功耗，甚至已有的安全措施也会因此而受到影响；

　　（3）SSL证书需要钱，功能越强大的证书费用越高，个人网站、小网站没有必要一般不会用。

　  （4）SSL证书通常需要绑定IP，不能在同一IP上绑定多个域名，IPv4资源不可能支撑这个消耗。

　　（5）HTTPS协议的加密范围也比较有限，在黑客攻击、拒绝服务攻击、服务器劫持等方面几乎起不到什么作用。最关键的，SSL证书的信用链体系并不安全，特别是在某些国家可以控制CA根证书的情况下，中间人攻击一样可行。

#### http切换到HTTPS

如果需要将网站从http切换到https到底该如何实现呢？

   这里需要将页面中所有的链接，例如js，css，图片等等链接都由http改为https。例如：http://www.baidu.com改为https://www.baidu.com

　　BTW，这里虽然将http切换为了https，还是建议保留http。所以我们在切换的时候可以做http和https的兼容，具体实现方式是，去掉页面链接中的http头部，这样可以自动匹配http头和https头。例如：将http://www.baidu.com改为//www.baidu.com。然后当用户从http的入口进入访问页面时，页面就是http，如果用户是从https的入口进入访问页面，页面即使https的。

### 三、区别

- HTTPS是HTTP协议的安全版本，HTTP协议的数据传输是明文的，是不安全的，HTTPS使用了SSL/TLS协议进行了加密处理，相对更安全
- HTTP 和 HTTPS 使用连接方式不同，默认端口也不一样，HTTP是80，HTTPS是443
- HTTPS 由于需要设计加密以及多次握手，性能方面不如 HTTP
- HTTPS需要SSL，SSL 证书需要钱，功能越强大的证书费用越高

### 参考文献

- https://www.cnblogs.com/klb561/p/10289199.html
- https://www.jianshu.com/p/205c0fc51c97
- https://vue3js.cn/interview

## 2、为什么说HTTPS比HTTP安全? HTTPS是如何保证安全的？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQBdfAico97doXuwBdicNiaFbUhjSHUuxkEEibygrS4s6AzH8JrvgolANjfIqr5ic1icTE7icMcKd198tsOQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、安全特性

在[什么是HTTP这篇文章](http://mp.weixin.qq.com/s?__biz=MzU1OTgxNDQ1Nw==&mid=2247487474&idx=2&sn=f951c4865fb338775b88ad2b9de36a25&chksm=fc10cda4cb6744b2993022c89864e8de836ff1f53a74d06ee0f58084e564b9a96719da376335&scene=21#wechat_redirect)中，我们了解到`HTTP`在通信过程中，存在以下问题：

- 通信使用明文（不加密），内容可能被窃听
- 不验证通信方的身份，因此有可能遭遇伪装

而`HTTPS`的出现正是解决这些问题，`HTTPS`是建立在`SSL`之上，其安全性由`SSL`来保证

在采用`SSL`后，`HTTP`就拥有了`HTTPS`的加密、证书和完整性保护这些功能

> SSL(Secure Sockets Layer 安全套接字协议),及其继任者传输层安全（Transport Layer Security，TLS）是为网络通信提供安全及数据完整性的一种安全协议

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQBdfAico97doXuwBdicNiaFbUp7tWoJEXK9GP7sRSHugh2CgdBOf7hH05aEXTKVOHdCQc2g4OEzpxUQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 二、如何做

`SSL`的实现这些功能主要依赖于三种手段：

- 对称加密：采用协商的密钥对数据加密
- 非对称加密：实现身份认证和密钥协商
- 摘要算法：验证信息的完整性
- 数字签名：身份验证

#### 对称加密

对称加密指的是加密和解密使用的秘钥都是同一个，是对称的。只要保证了密钥的安全，那整个通信过程就可以说具有了机密性

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQBdfAico97doXuwBdicNiaFbUFYKiaHOibFCrZTxXWGmbsSQTOia62HEibrNR79mTjMCpA0ibA5QlNLejIuQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 非对称加密

非对称加密，存在两个秘钥，一个叫公钥，一个叫私钥。两个秘钥是不同的，公钥可以公开给任何人使用，私钥则需要保密

公钥和私钥都可以用来加密解密，但公钥加密后只能用私钥解 密，反过来，私钥加密后也只能用公钥解密

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQBdfAico97doXuwBdicNiaFbUkFjYgic6MHBM0ticB8AloQAjX3FTc6AUd7f7ZfvQASOfzYMn4lsp7kNQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 混合加密

在`HTTPS`通信过程中，采用的是对称加密+非对称加密，也就是混合加密

在对称加密中讲到，如果能够保证了密钥的安全，那整个通信过程就可以说具有了机密性

而`HTTPS`采用非对称加密解决秘钥交换的问题

具体做法是发送密文的一方使用对方的公钥进行加密处理“对称的密钥”，然后对方用自己的私钥解密拿到“对称的密钥”

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQBdfAico97doXuwBdicNiaFbUlwwVUU0ZFLOhvDFEOlgKCohDwdKRDkfwrBiaBk4pD3yXwDZVHn1W4Kg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

这样可以确保交换的密钥是安全的前提下，使用对称加密方式进行通信

##### 举个例子：

网站秘密保管私钥，在网上任意分发公钥，你想要登录网站只要用公钥加密就行了，密文只能由私钥持有者才能解密。而黑客因为没有私钥，所以就无法破解密文

上述的方法解决了数据加密，在网络传输过程中，数据有可能被篡改，并且黑客可以伪造身份发布公钥，如果你获取到假的公钥，那么混合加密也并无多大用处，你的数据扔被黑客解决

因此，在上述加密的基础上仍需加上完整性、身份验证的特性，来实现真正的安全，实现这一功能则是摘要算法

#### 摘要算法

实现完整性的手段主要是摘要算法，也就是常说的散列函数、哈希函数

可以理解成一种特殊的压缩算法，它能够把任意长度的数据“压缩”成固定长度、而且独一无二的“摘要”字符串，就好像是给这段数据生成了一个数字“指纹”

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQBdfAico97doXuwBdicNiaFbUic9s6wbsn0ZQ28l6SFXYHJuxerPZy7zGHtNBwYRJ5dKFia4QuIXicwtmA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

摘要算法保证了“数字摘要”和原文是完全等价的。所以，我们只要在原文后附上它的摘要，就能够保证数据的完整性

比如，你发了条消息：“转账 1000 元”，然后再加上一个 SHA-2 的摘要。网站收到后也计算一下消息的摘要，把这两份“指纹”做个对比，如果一致，就说明消息是完整可信的，没有被修改

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQBdfAico97doXuwBdicNiaFbUDLZEiaCtmUx2DZ9WiaCOzicn5xia1TJG0BphFPKU7o5OQZypjQwkjOuAibQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 数字签名

数字签名能确定消息确实是由发送方签名并发出来的，因为别人假冒不了发送方的签名

原理其实很简单，就是用私钥加密，公钥解密

签名和公钥一样完全公开，任何人都可以获取。但这个签名只有用私钥对应的公钥才能解开，拿到摘要后，再比对原文验证完整性，就可以像签署文件一样证明消息确实是你发的

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQBdfAico97doXuwBdicNiaFbUO23gQ4Wib7oYk6t4qIpkM3yGicAzQOIGFGoM3apbKaGPpnibXvZv4PcrA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

和消息本身一样，因为谁都可以发布公钥，我们还缺少防止黑客伪造公钥的手段，也就是说，怎么判断这个公钥就是你的公钥

这时候就需要一个第三方，就是证书验证机构

#### CA验证机构

数字证书认证机构处于客户端与服务器双方都可信赖的第三方机构的立场

CA 对公钥的签名认证要求包括序列号、用途、颁发者、有效时间等等，把这些打成一个包再签名，完整地证明公钥关联的各种信息，形成“数字证书”

流程如下图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQBdfAico97doXuwBdicNiaFbU7JpXWgGUCqzANXa1gg91UZNohvAKpJH0tY6XvX1QZzdN7he3Nj5TUA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

- 服务器的运营人员向数字证书认证机构提出公开密钥的申请
- 数字证书认证机构在判明提出申请者的身份之后，会对已申请的公开密钥做数字签名
- 然后分配这个已签名的公开密钥，并将该公开密钥放入公钥证书后绑定在一起
- 服务器会将这份由数字证书认证机构颁发的数字证书发送给客户端，以进行非对称加密方式通信

接到证书的客户端可使用数字证书认证机构的公开密钥，对那张证书上的数字签名进行验证，一旦验证通过，则证明：

- 认证服务器的公开密钥的是真实有效的数字证书认证机构
- 服务器的公开密钥是值得信赖的

### 三、总结

可以看到，`HTTPS`与`HTTP`虽然只差一个`SSL`，但是通信安全得到了大大的保障，通信的四大特性都以解决，解决方式如下：

- 机密性：混合算法
- 完整性：摘要算法
- 身份认证：数字签名
- 不可否定：数字签名

同时引入第三方证书机构，确保公开秘钥的安全性

### 参考文献

- https://zhuanlan.zhihu.com/p/100657391
- https://juejin.cn/post/6844903830987997197#heading-7
- https://cloud.tencent.com/developer/article/1748862

## 3、如何理解OSI七层模型?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQuhT3ib0yKlKibfibnff4pLpI3cxYVhFuhc5CWqUxKvYSdV39ewUjAiacic6ibE9qZTvUaia5TqA4EibjPSg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

OSI （Open System Interconnect）模型全称为开放式通信系统互连参考模型，是国际标准化组织 ( ISO ) 提出的一个试图使各种计算机在世界范围内互连为网络的标准框架

`OSI`将计算机网络体系结构划分为七层，每一层实现各自的功能和协议，并完成与相邻层的接口通信。即每一层扮演固定的角色，互不打扰

### 二、划分

`OSI`主要划分了七层，如下图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQuhT3ib0yKlKibfibnff4pLpIqT4WAUpQqGp7XBdVnHZcJLHsLf2PibOWKI6wric6E8qtww3yWNIiabSkw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 应用层

应用层位于 OSI 参考模型的第七层，其作用是通过应用程序间的交互来完成特定的网络应用

该层协议定义了应用进程之间的交互规则，通过不同的应用层协议为不同的网络应用提供服务。例如域名系统 `DNS`，支持万维网应用的 `HTTP` 协议，电子邮件系统采用的 `SMTP`协议等

在应用层交互的数据单元我们称之为报文

#### 表示层

表示层的作用是使通信的应用程序能够解释交换数据的含义，其位于 `OSI`参考模型的第六层，向上为应用层提供服务，向下接收来自会话层的服务

该层提供的服务主要包括数据压缩，数据加密以及数据描述，使应用程序不必担心在各台计算机中表示和存储的内部格式差异

#### 会话层

会话层就是负责建立、管理和终止表示层实体之间的通信会话

该层提供了数据交换的定界和同步功能，包括了建立检查点和恢复方案的方法

#### 传输层

传输层的主要任务是为两台主机进程之间的通信提供服务，处理数据包错误、数据包次序，以及其他一些关键传输问题

传输层向高层屏蔽了下层数据通信的细节。因此，它是计算机通信体系结构中关键的一层

其中，主要的传输层协议是`TCP`和`UDP`

#### 网络层

两台计算机之间传送数据时其通信链路往往不止一条，所传输的信息甚至可能经过很多通信子网

网络层的主要任务就是选择合适的网间路由和交换节点，确保数据按时成功传送

在发送数据时，网络层把传输层产生的报文或用户数据报封装成分组和包，向下传输到数据链路层

在网络层使用的协议是无连接的网际协议（Internet Protocol）和许多路由协议，因此我们通常把该层简单地称为 IP 层

#### 数据链路层

数据链路层通常也叫做链路层，在物理层和网络层之间。两台主机之间的数据传输，总是在一段一段的链路上传送的，这就需要使用专门的链路层协议

在两个相邻节点之间传送数据时，数据链路层将网络层交下来的 `IP`数据报组装成帧，在两个相邻节点间的链路上传送帧

每一帧的数据可以分成：报头`head`和数据`data`两部分:

- head 标明数据发送者、接受者、数据类型，如 MAC地址
- data 存储了计算机之间交互的数据

通过控制信息我们可以知道一个帧的起止比特位置，此外，也能使接收端检测出所收到的帧有无差错，如果发现差错，数据链路层能够简单的丢弃掉这个帧，以避免继续占用网络资源

#### 物理层

作为`OSI` 参考模型中最低的一层，物理层的作用是实现计算机节点之间比特流的透明传送

该层的主要任务是确定与传输媒体的接口的一些特性（机械特性、电气特性、功能特性，过程特性）

该层主要是和硬件有关，与软件关系不大

### 三、传输过程

数据在各层之间的传输如下图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQuhT3ib0yKlKibfibnff4pLpITJ4ZKhDPWbuf2HPUpCTV8XF8YYTicyYm9y1PwNJQ9kpTwNP8iakCebgA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

- 应用层报文被传送到运输层
- 在最简单的情况下，运输层收取到报文并附上附加信息，该首部将被接收端的运输层使用
- 应用层报文和运输层首部信息一道构成了运输层报文段。附加的信息可能包括：允许接收端运输层向上向适当的应用程序交付报文的信息以及差错检测位信息。该信息让接收端能够判断报文中的比特是否在途中已被改变
- 运输层则向网络层传递该报文段，网络层增加了如源和目的端系统地址等网络层首部信息，生成了网络层数据报
- 网络层数据接下来被传递给链路层，在数据链路层数据包添加发送端 MAC 地址和接收端 MAC 地址后被封装成数据帧
- 在物理层数据帧被封装成比特流，之后通过传输介质传送到对端
- 对端再一步步解开封装，获取到传送的数据

### 参考文献

- https://zh.wikipedia.org/wiki/OSI%E6%A8%A1%E5%9E%8B
- https://zhuanlan.zhihu.com/p/32059190
- https://leetcode-cn.com/leetbook/detail/networks-interview-highlights/
- https://vue3js.cn/interview

## 4、如何理解UDP 和 TCP? 区别? 应用场景?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRn1aTIUxxEF1TrY9OM5OTaSa44OCBiaGRFLr8fY8icoLI1yZRR05cAYzkdcvSvYrXicfIvhewwb5qsg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、UDP

UDP（User Datagram Protocol），用户数据包协议，是一个简单的「面向数据报的通信协议」，即对应用层交下来的报文，不合并，不拆分，只是在其上面加上首部后就交给了下面的网络层

也就是说无论应用层交给`UDP`多长的报文，它统统发送，一次发送一个报文

而对接收方，接到后直接去除首部，交给上面的应用层就完成任务

`UDP`报头包括4个字段，每个字段占用2个字节（即16个二进制位），标题短，开销小

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRn1aTIUxxEF1TrY9OM5OTaIbgO1D2CX8SKKUQwujyAhMdrOgCHDJ9bpxHZd9GYEjmIzyhRc7Ys1w/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

特点如下：

- UDP 不提供复杂的控制机制，利用 IP 提供面向无连接的通信服务
- 传输途中出现丢包，UDP 也不负责重发
- 当包的到达顺序出现乱序时，UDP没有纠正的功能。
- 并且它是将应用程序发来的数据在收到的那一刻，立即按照原样发送到网络上的一种机制。即使是出现网络拥堵的情况，UDP 也无法进行流量控制等避免网络拥塞行为

### 二、TCP

TCP（Transmission Control Protocol），传输控制协议，是一种可靠、「面向字节流的通信协议」，把上面应用层交下来的数据看成无结构的字节流来发送

可以想象成流水形式的，发送方TCP会将数据放入“蓄水池”（缓存区），等到可以发送的时候就发送，不能发送就等着，TCP会根据当前网络的拥塞状态来确定每个报文段的大小

`TCP`报文首部有20个字节，额外开销大

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRn1aTIUxxEF1TrY9OM5OTa762ic1NDA46iatH8kzqyw8016xdURTbYVsZprQdWxES6sgL8nfTxmXIA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

特点如下：

- TCP充分地实现了数据传输时各种控制功能，可以进行丢包时的重发控制，还可以对次序乱掉的分包进行顺序控制。而这些在 UDP 中都没有。
- 此外，TCP 作为一种面向有连接的协议，只有在确认通信对端存在时才会发送数据，从而可以控制通信流量的浪费。
- 根据 TCP 的这些机制，在 IP 这种无连接的网络上也能够实现高可靠性的通信（ 主要通过校验和、序列号、确认应答、重发控制、连接管理以及窗口控制等机制实现）





### 三、区别

`UDP`与`TCP`两者的都位于传输层，如下图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRn1aTIUxxEF1TrY9OM5OTaFmgMXKlmEkJCYIWHIxUbOZN7wmkG6hiczYvhhicg8oAypHgkFK35GvLA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

两者区别如下表所示：

|          | TCP                              | UDP                            |
| :------- | :------------------------------- | :----------------------------- |
| 可靠性   | 可靠                             | 不可靠                         |
| 连接性   | 面向连接                         | 无连接                         |
| 报文     | 面向字节流                       | 面向报文                       |
| 效率     | 传输效率低                       | 传输效率高                     |
| 双共性   | 全双工                           | 一对一、一对多、多对一、多对多 |
| 流量控制 | 滑动窗口                         | 无                             |
| 拥塞控制 | 慢开始、拥塞避免、快重传、快恢复 | 无                             |
| 传输效率 | 慢                               | 快                             |

- TCP 是面向连接的协议，建立连接3次握手、断开连接四次挥手，UDP是面向无连接，数据传输前后不连接连接，发送端只负责将数据发送到网络，接收端从消息队列读取
- TCP 提供可靠的服务，传输过程采用流量控制、编号与确认、计时器等手段确保数据无差错，不丢失。UDP 则尽可能传递数据，但不保证传递交付给对方
- TCP 面向字节流，将应用层报文看成一串无结构的字节流，分解为多个TCP报文段传输后，在目的站重新装配。UDP协议面向报文，不拆分应用层报文，只保留报文边界，一次发送一个报文，接收方去除报文首部后，原封不动将报文交给上层应用
- TCP 只能点对点全双工通信。UDP 支持一对一、一对多、多对一和多对多的交互通信

两者应用场景如下图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRn1aTIUxxEF1TrY9OM5OTaAaIt5wr0Hicibsics5E8jpJl4fH8hcibrO3YWcfqEYTr36m5ibzKFjEcWvQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

可以看到，TCP 应用场景适用于对效率要求低，对准确性要求高或者要求有链接的场景，而UDP 适用场景为对效率要求高，对准确性要求低的场景

### 参考文献

- https://zh.wikipedia.org
- https://www.shangmayuan.com/a/a1e3ceb218284cefb95de7fd.html
- https://segmentfault.com/a/1190000021815671
- https://vue3js.cn/interview

## 5、如何理解TCP/IP协议?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQf9CuCHJ8PXGLzhvbkMgGic91fScdQt4WFQLiaMicuaOYiaJr2sAu9zWSzeUQhhP5JJ7xys67vAvlTzg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

TCP/IP，「传输控制协议」/「网际协议」，是指能够在多个不同网络间实现信息传输的协议簇

- TCP（传输控制协议）

一种面向连接的、可靠的、基于字节流的传输层通信协议

- IP（网际协议）

用于封包交换数据网络的协议

TCP/IP协议不仅仅指的是`TCP`和`IP`两个协议，而是指一个由`FTP`、`SMTP`、`TCP`、`UDP`、`IP`等协议构成的协议簇，

只是因为在`TCP/IP`协议中`TCP`协议和`IP`协议最具代表性，所以通称为TCP/IP协议族（英语：TCP/IP Protocol Suite，或TCP/IP Protocols）

### 二、划分

TCP/IP协议族按层次分别了五层体系或者四层体系

五层体系的协议结构是综合了 OSI 和 TCP/IP 优点的一种协议，包括应用层、传输层、网络层、数据链路层和物理层

五层协议的体系结构只是为介绍网络原理而设计的，实际应用还是 TCP/IP 四层体系结构，包括应用层、传输层、网络层（网际互联层）、网络接口层

如下图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQf9CuCHJ8PXGLzhvbkMgGico85FP9qZ8gZL1YgWSVNzqfica1HmXY56mQQszicbk066HqKDLZISdNhA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 五层体系

##### 应用层

`TCP/IP` 模型将 `OSI`参考模型中的会话层、表示层和应用层的功能合并到一个应用层实现，通过不同的应用层协议为不同的应用提供服务

如：`FTP`、`Telnet`、`DNS`、`SMTP` 等

##### 传输层

该层对应于 OSI 参考模型的传输层，为上层实体提供源端到对端主机的通信功能

传输层定义了两个主要协议：传输控制协议（TCP）和用户数据报协议（UDP）

其中面向连接的 TCP 协议保证了数据的传输可靠性，面向无连接的 UDP 协议能够实现数据包简单、快速地传输

##### 网络层

负责为分组网络中的不同主机提供通信服务，并通过选择合适的路由将数据传递到目标主机

在发送数据时，网络层把运输层产生的报文段或用户数据封装成分组或包进行传送

##### 数据链路层

数据链路层在两个相邻节点传输数据时，将网络层交下来的IP数据报组装成帧，在两个相邻节点之间的链路上传送帧

##### 物理层

保数据可以在各种物理媒介上进行传输，为数据的传输提供可靠的环境

#### 四层体系

TCP/IP 的四层结构则如下表所示：

| 层次名称   | 单位   | 功 能                                                     | 协 议                                                        |
| :--------- | :----- | :-------------------------------------------------------- | :----------------------------------------------------------- |
| 网络接口层 | 帧     | 负责实际数据的传输，对应OSI参考模型的下两层               | HDLC（高级链路控制协议）PPP（点对点协议） SLIP（串行线路接口协议） |
| 网络层     | 数据报 | 负责网络间的寻址数据传输，对应OSI参考模型的第三层         | IP（网际协议） ICMP（网际控制消息协议）ARP（地址解析协议） RARP（反向地址解析协议） |
| 传输层     | 报文段 | 负责提供可靠的传输服务，对应OSI参考模型的第四层           | TCP（控制传输协议） UDP（用户数据报协议）                    |
| 应用层     |        | 负责实现一切与应用程序相关的功能，对应OSI参考模型的上三层 | FTP（文件传输协议） HTTP（超文本传输协议） DNS（域名服务器协议）SMTP（简单邮件传输协议）NFS（网络文件系统协议） |

### 三、总结

OSI 参考模型与 TCP/IP 参考模型区别如下：

相同点：

- OSI 参考模型与 TCP/IP 参考模型都采用了层次结构
- 都能够提供面向连接和无连接两种通信服务机制

不同点：

- OSI 采用的七层模型；TCP/IP 是四层或五层结构
- TCP/IP 参考模型没有对网络接口层进行细分，只是一些概念性的描述；OSI 参考模型对服务和协议做了明确的区分
- OSI 参考模型虽然网络划分为七层，但实现起来较困难。TCP/IP 参考模型作为一种简化的分层结构是可以的
- TCP/IP协议去掉表示层和会话层的原因在于会话层、表示层、应用层都是在应用程序内部实现的，最终产出的是一个应用数据包，而应用程序之间是几乎无法实现代码的抽象共享的，这也就造成 `OSI` 设想中的应用程序维度的分层是无法实现的

三种模型对应关系如下图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQf9CuCHJ8PXGLzhvbkMgGiciapfjWiaPdGzVV84OGbP0LsQBbk7RIbMUacXBbxyyelVZRGqznh2txZQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 参考文献

- https://zh.wikipedia.org/wiki/TCP/IP%E5%8D%8F%E8%AE%AE%E6%97%8F
- https://zhuanlan.zhihu.com/p/103162095
- https://segmentfault.com/a/1190000039204681
- https://leetcode-cn.com/leetbook/detail/networks-interview-highlights/
- https://vue3js.cn/interview

## 6、DNS 协议是什么？说说 DNS 完整的查询过程?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSEqlDcYXxzZZiaV2hNg3icQJ5VXa9rticIWKRx4Nfw1rdVh0yKGaXLeaX6ojN0hld4BEykv85jzGsbQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

DNS（Domain Names System），域名系统，是互联网一项服务，是进行域名和与之相对应的 IP 地址进行转换的服务器

简单来讲，`DNS`相当于一个翻译官，负责将域名翻译成`ip`地址

- IP 地址：一长串能够唯一地标记网络上的计算机的数字
- 域名：是由一串用点分隔的名字组成的 Internet 上某一台计算机或计算机组的名称，用于在数据传输时对计算机的定位标识

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSEqlDcYXxzZZiaV2hNg3icQJSGNM0XRekhhp937Ehyib6KUVB3C8Q2icAzbgY1snPOvhjf6mblVbanNw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 二、域名

域名是一个具有层次的结构，从上到下一次为根域名、顶级域名、二级域名、三级域名...

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSEqlDcYXxzZZiaV2hNg3icQJQZkdsTSicRrUy8SLGsz9G5B1iceTDyyOHmjkMr5LNFSoD8nuXmlkCz9A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

例如`www.xxx.com`，`www`为三级域名、`xxx`为二级域名、`com`为顶级域名，系统为用户做了兼容，域名末尾的根域名`.`一般不需要输入

在域名的每一层都会有一个域名服务器，如下图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSEqlDcYXxzZZiaV2hNg3icQJSyr0qMH7msFkwicaGs2hKwKmBwxtLq5GELFoXAJ3ZYNvzKwxh9iap8xg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

除此之外，还有电脑默认的本地域名服务器

### 三、查询方式

DNS 查询的方式有两种：

- 递归查询：如果 A 请求 B，那么 B 作为请求的接收者一定要给 A 想要的答案

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSEqlDcYXxzZZiaV2hNg3icQJ2raLDp9yV3CibkibyVvCxYeVdpeShaz2UexlSWs3Jk7iccv8UIQKpMgXw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

- 迭代查询：如果接收者 B 没有请求者 A 所需要的准确内容，接收者 B 将告诉请求者 A，如何去获得这个内容，但是自己并不去发出请求

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSEqlDcYXxzZZiaV2hNg3icQJY61MibjHbtq9WQYzL03wY2dFfy4lmk7kufBHclm7eSXjykvxdKN7WqQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 四、域名缓存

在域名服务器解析的时候，使用缓存保存域名和`IP`地址的映射

计算机中`DNS`的记录也分成了两种缓存方式：

- 浏览器缓存：浏览器在获取网站域名的实际 IP 地址后会对其进行缓存，减少网络请求的损耗
- 操作系统缓存：操作系统的缓存其实是用户自己配置的 `hosts` 文件

### 五、查询过程

解析域名的过程如下：

- 首先搜索浏览器的 DNS 缓存，缓存中维护一张域名与 IP 地址的对应表

- 若没有命中，则继续搜索操作系统的 DNS 缓存

- 若仍然没有命中，则操作系统将域名发送至本地域名服务器，本地域名服务器采用递归查询自己的 DNS 缓存，查找成功则返回结果

- 若本地域名服务器的 DNS 缓存没有命中，则本地域名服务器向上级域名服务器进行迭代查询

- - 首先本地域名服务器向根域名服务器发起请求，根域名服务器返回顶级域名服务器的地址给本地服务器
  - 本地域名服务器拿到这个顶级域名服务器的地址后，就向其发起请求，获取权限域名服务器的地址
  - 本地域名服务器根据权限域名服务器的地址向其发起请求，最终得到该域名对应的 IP 地址

- 本地域名服务器将得到的 IP 地址返回给操作系统，同时自己将 IP 地址缓存起来

- 操作系统将 IP 地址返回给浏览器，同时自己也将 IP 地址缓存起

- 至此，浏览器就得到了域名对应的 IP 地址，并将 IP 地址缓存起

流程如下图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSEqlDcYXxzZZiaV2hNg3icQJKZMS9DG8QoEz05Paf4PhyuJFyibXwEGP5UwtRe9KQat1icicRaFbM6pAw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 参考文献

- https://zh.wikipedia.org/wiki/%E5%9F%9F%E5%90%8D%E7%B3%BB%E7%BB%9F
- https://www.cnblogs.com/jmilkfan-fanguiju/p/12789677.html
- https://segmentfault.com/a/1190000039039275
- https://vue3js.cn/interview

## 7、如何理解CDN？说说实现原理？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTNPuJrXCESk4IJcqb6P4QFWJyja3AQmib2ictUZzA6LVNz7rSyxLXQxy1flRmC31PZGL00gVibo7RzQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

CDN (全称 Content Delivery Network)，即内容分发网络

构建在现有网络基础之上的智能虚拟网络，依靠部署在各地的边缘服务器，通过中心平台的负载均衡、内容分发、调度等功能模块，使用户就近获取所需内容，降低网络拥塞，提高用户访问响应速度和命中率。`CDN` 的关键技术主要有内容存储和分发技术

简单来讲，`CDN`就是根据用户位置分配最近的资源

于是，用户在上网的时候不用直接访问源站，而是访问离他“最近的”一个 CDN 节点，术语叫「边缘节点」，其实就是缓存了源站内容的代理服务器。如下图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTNPuJrXCESk4IJcqb6P4QFNuU1jNSnNQMn3a5BArXqATE4Lb6GQ9dJ1ofDr5wS1nfBWpGDtLLexg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 二、原理分析

在没有应用`CDN`时，我们使用域名访问某一个站点时的路径为

> 用户提交域名→浏览器对域名进行解释→`DNS` 解析得到目的主机的IP地址→根据IP地址访问发出请求→得到请求数据并回复

应用`CDN`后，`DNS` 返回的不再是 `IP` 地址，而是一个`CNAME`(Canonical Name ) 别名记录，指向`CDN`的全局负载均衡

`CNAME`实际上在域名解析的过程中承担了中间人（或者说代理）的角色，这是`CDN`实现的关键

#### 负载均衡系统

由于没有返回`IP`地址，于是本地`DNS`会向负载均衡系统再发送请求  ，则进入到`CDN`的全局负载均衡系统进行智能调度：

- 看用户的 IP 地址，查表得知地理位置，找相对最近的边缘节点
- 看用户所在的运营商网络，找相同网络的边缘节点
- 检查边缘节点的负载情况，找负载较轻的节点
- 其他，比如节点的“健康状况”、服务能力、带宽、响应时间等

结合上面的因素，得到最合适的边缘节点，然后把这个节点返回给用户，用户就能够就近访问`CDN`的缓存代理

整体流程如下图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTNPuJrXCESk4IJcqb6P4QFcZHhOwDHyPianicWJ1TbPabs35PM4nVfj7x1u9tpz226iby0GB9GuWlCA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 缓存代理

缓存系统是 `CDN`的另一个关键组成部分，缓存系统会有选择地缓存那些最常用的那些资源

其中有两个衡量`CDN`服务质量的指标：

- 命中率：用户访问的资源恰好在缓存系统里，可以直接返回给用户，命中次数与所有访问次数之比
- 回源率：缓存里没有，必须用代理的方式回源站取，回源次数与所有访问次数之比

缓存系统也可以划分出层次，分成一级缓存节点和二级缓存节点。一级缓存配置高一些，直连源站，二级缓存配置低一些，直连用户

回源的时候二级缓存只找一级缓存，一级缓存没有才回源站，可以有效地减少真正的回源

现在的商业 `CDN`命中率都在 90% 以上，相当于把源站的服务能力放大了 10 倍以上

### 三、总结

`CDN` 目的是为了改善互联网的服务质量，通俗一点说其实就是提高访问速度

`CDN` 构建了全国、全球级别的专网，让用户就近访问专网里的边缘节点，降低了传输延迟，实现了网站加速

通过`CDN`的负载均衡系统，智能调度边缘节点提供服务，相当于`CDN`服务的大脑，而缓存系统相当于`CDN`的心脏，缓存命中直接返回给用户，否则回源

### 参考文献

- https://zh.wikipedia.org/wiki/內容傳遞網路
- https://juejin.cn/post/6844903890706661389#heading-5
- https://blog.csdn.net/lxx309707872/article/details/109078783

## 8、说说 HTTP1.0/1.1/2.0 的区别?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSEsCx29vIOiarmTtba3SeyaHEibgq9iaeqICvKV6ccibMciaODbzibmKpick3aVKxXVzZkuYdTGWJSEeVog/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、HTTP1.0

`HTTP`协议的第二个版本，第一个在通讯中指定版本号的HTTP协议版本

`HTTP 1.0` 浏览器与服务器只保持短暂的连接，每次请求都需要与服务器建立一个`TCP`连接

服务器完成请求处理后立即断开`TCP`连接，服务器不跟踪每个客户也不记录过去的请求

简单来讲，每次与服务器交互，都需要新开一个连接

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSEsCx29vIOiarmTtba3SeyaqHb877A8KqSTBnG7Py9by6vqZGN3pbH9DDdk4orN9EmbEGhdibF3u9A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

例如，解析`html`文件，当发现文件中存在资源文件的时候，这时候又创建单独的链接

最终导致，一个`html`文件的访问包含了多次的请求和响应，每次请求都需要创建连接、关系连接

这种形式明显造成了性能上的缺陷

如果需要建立长连接，需要设置一个非标准的Connection字段 `Connection: keep-alive`

### 二、HTTP1.1

在`HTTP1.1`中，默认支持长连接（`Connection: keep-alive`），即在一个TCP连接上可以传送多个`HTTP`请求和响应，减少了建立和关闭连接的消耗和延迟

建立一次连接，多次请求均由这个连接完成

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSEsCx29vIOiarmTtba3SeyaJ66pZduQKGT9sYKHofMh7zWlp7ic0kJ9Bg3z4QWGh1Nhh2g1ZW7Mahg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

这样，在加载`html`文件的时候，文件中多个请求和响应就可以在一个连接中传输

同时，`HTTP 1.1`还允许客户端不用等待上一次请求结果返回，就可以发出下一次请求，但服务器端必须按照接收到客户端请求的先后顺序依次回送响应结果，以保证客户端能够区分出每次请求的响应内容，这样也显著地减少了整个下载过程所需要的时间

同时，`HTTP1.1`在`HTTP1.0`的基础上，增加更多的请求头和响应头来完善的功能，如下：

- 引入了更多的缓存控制策略，如If-Unmodified-Since, If-Match, If-None-Match等缓存头来控制缓存策略
- 引入range，允许值请求资源某个部分
- 引入host，实现了在一台WEB服务器上可以在同一个IP地址和端口号上使用不同的主机名来创建多个虚拟WEB站点

并且还添加了其他的请求方法：`put`、`delete`、`options`...

### 三、HTTP2.0

而`HTTP2.0`在相比之前版本，性能上有很大的提升，如添加了一个特性：

- 多路复用
- 二进制分帧
- 首部压缩
- 服务器推送

#### 多路复用

`HTTP/2` 复用`TCP`连接，在一个连接里，客户端和浏览器都可以「同时」发送多个请求或回应，而且不用按照顺序一一对应，这样就避免了”队头堵塞”

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSEsCx29vIOiarmTtba3SeyacSVEQL8IQlGia3YyricVYuZHRDvqNLHsjf5neS0tUn3DLgku8MjzcEtg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

上图中，可以看到第四步中`css`、`js`资源是同时发送到服务端

#### 二进制分帧

帧是`HTTP2`通信中最小单位信息

`HTTP/2` 采用二进制格式传输数据，而非 `HTTP 1.x`的文本格式，解析起来更高效

将请求和响应数据分割为更小的帧，并且它们采用二进制编码

`HTTP2`中，同域名下所有通信都在单个连接上完成，该连接可以承载任意数量的双向数据流

每个数据流都以消息的形式发送，而消息又由一个或多个帧组成。多个帧之间可以乱序发送，根据帧首部的流标识可以重新组装，这也是多路复用同时发送数据的实现条件

#### 首部压缩

`HTTP/2`在客户端和服务器端使用“首部表”来跟踪和存储之前发送的键值对，对于相同的数据，不再通过每次请求和响应发送

首部表在`HTTP/2`的连接存续期内始终存在，由客户端和服务器共同渐进地更新

例如：下图中的两个请求， 请求一发送了所有的头部字段，第二个请求则只需要发送差异数据，这样可以减少冗余数据，降低开销

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSEsCx29vIOiarmTtba3SeyapoOjxvPuUU036DfbN1lWNFVjwuAr1jp8mCRrbZiasvfgEaAfLhpqcibw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 服务器推送

`HTTP2`引入服务器推送，允许服务端推送资源给客户端

服务器会顺便把一些客户端需要的资源一起推送到客户端，如在响应一个页面请求中，就可以随同页面的其它资源

免得客户端再次创建连接发送请求到服务器端获取

这种方式非常合适加载静态资源

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSEsCx29vIOiarmTtba3SeyauvgibjAXAZFhtia9AIRyPGZibLqb0HVbUbOsIFxC7lAZkk8jK8nric3CBw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 四、总结

HTTP1.0：

- 浏览器与服务器只保持短暂的连接，浏览器的每次请求都需要与服务器建立一个TCP连接

HTTP1.1：

- 引入了持久连接，即TCP连接默认不关闭，可以被多个请求复用
- 在同一个TCP连接里面，客户端可以同时发送多个请求
- 虽然允许复用TCP连接，但是同一个TCP连接里面，所有的数据通信是按次序进行的，服务器只有处理完一个请求，才会接着处理下一个请求。如果前面的处理特别慢，后面就会有许多请求排队等着
- 新增了一些请求方法
- 新增了一些请求头和响应头

HTTP2.0：

- 采用二进制格式而非文本格式
- 完全多路复用，而非有序并阻塞的、只需一个连接即可实现并行
- 使用报头压缩，降低开销
- 服务器推送

### 参考文献

- https://zh.wikipedia.org/wiki/%E8%B6%85%E6%96%87%E6%9C%AC%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE#HTTP/1.0
- https://www.jianshu.com/p/52d86558ca57
- https://segmentfault.com/a/1190000016496448
- https://zhuanlan.zhihu.com/p/26559480

## 9、说说 HTTP 常见的状态码有哪些，适用场景？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQHN68hg7z8NbCQ8W5k061z09CWFwPssRPlApRVdW58u912ggcoCCRxD6cxugs4DO24iaXdmXCD9gQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

HTTP状态码（英语：HTTP Status Code），用以表示网页服务器超文本传输协议响应状态的3位数字代码

它由 RFC 2616规范定义的，并得到 `RFC 2518`、`RFC 2817`、`RFC 2295`、`RFC 2774`与 `RFC 4918`等规范扩展

简单来讲，`http`状态码的作用是服务器告诉客户端当前请求响应的状态，通过状态码就能判断和分析服务器的运行状态

### 二、分类

状态码第一位数字决定了不同的响应状态，有如下：

- 1 表示消息
- 2 表示成功
- 3 表示重定向
- 4 表示请求错误
- 5 表示服务器错误

#### 1xx

代表请求已被接受，需要继续处理。这类响应是临时响应，只包含状态行和某些可选的响应头信息，并以空行结束

常见的有：

- 100（客户端继续发送请求，这是临时响应）：这个临时响应是用来通知客户端它的部分请求已经被服务器接收，且仍未被拒绝。客户端应当继续发送请求的剩余部分，或者如果请求已经完成，忽略这个响应。服务器必须在请求完成后向客户端发送一个最终响应
- 101：服务器根据客户端的请求切换协议，主要用于websocket或http2升级

#### 2xx

代表请求已成功被服务器接收、理解、并接受

常见的有：

- 200（成功）：请求已成功，请求所希望的响应头或数据体将随此响应返回
- 201（已创建）：请求成功并且服务器创建了新的资源
- 202（已创建）：服务器已经接收请求，但尚未处理
- 203（非授权信息）：服务器已成功处理请求，但返回的信息可能来自另一来源
- 204（无内容）：服务器成功处理请求，但没有返回任何内容
- 205（重置内容）：服务器成功处理请求，但没有返回任何内容
- 206（部分内容）：服务器成功处理了部分请求

#### 3xx

表示要完成请求，需要进一步操作。通常，这些状态代码用来重定向

常见的有：

- 300（多种选择）：针对请求，服务器可执行多种操作。服务器可根据请求者 (user agent) 选择一项操作，或提供操作列表供请求者选择
- 301（永久移动）：请求的网页已永久移动到新位置。服务器返回此响应（对 GET 或 HEAD 请求的响应）时，会自动将请求者转到新位置
- 302（临时移动）：服务器目前从不同位置的网页响应请求，但请求者应继续使用原有位置来进行以后的请求
- 303（查看其他位置）：请求者应当对不同的位置使用单独的 GET 请求来检索响应时，服务器返回此代码
- 305 （使用代理）：请求者只能使用代理访问请求的网页。如果服务器返回此响应，还表示请求者应使用代理
- 307 （临时重定向）：服务器目前从不同位置的网页响应请求，但请求者应继续使用原有位置来进行以后的请求

#### 4xx

代表了客户端看起来可能发生了错误，妨碍了服务器的处理

常见的有：

- 400（错误请求）：服务器不理解请求的语法
- 401（未授权）：请求要求身份验证。对于需要登录的网页，服务器可能返回此响应。
- 403（禁止）：服务器拒绝请求
- 404（未找到）：服务器找不到请求的网页
- 405（方法禁用）：禁用请求中指定的方法
- 406（不接受）：无法使用请求的内容特性响应请求的网页
- 407（需要代理授权）：此状态代码与 401（未授权）类似，但指定请求者应当授权使用代理
- 408（请求超时）：服务器等候请求时发生超时

#### 5xx

表示服务器无法完成明显有效的请求。这类状态码代表了服务器在处理请求的过程中有错误或者异常状态发生

常见的有：

- 500（服务器内部错误）：服务器遇到错误，无法完成请求
- 501（尚未实施）：服务器不具备完成请求的功能。例如，服务器无法识别请求方法时可能会返回此代码
- 502（错误网关）：服务器作为网关或代理，从上游服务器收到无效响应
- 503（服务不可用）：服务器目前无法使用（由于超载或停机维护）
- 504（网关超时）：服务器作为网关或代理，但是没有及时从上游服务器收到请求
- 505（HTTP 版本不受支持）：服务器不支持请求中所用的 HTTP 协议版本

### 三、适用场景

下面给出一些状态码的适用场景：

- 100：客户端在发送POST数据给服务器前，征询服务器情况，看服务器是否处理POST的数据，如果不处理，客户端则不上传POST数据，如果处理，则POST上传数据。常用于POST大数据传输
- 206：一般用来做断点续传，或者是视频文件等大文件的加载
- 301：永久重定向会缓存。新域名替换旧域名，旧的域名不再使用时，用户访问旧域名时用301就重定向到新的域名
- 302：临时重定向不会缓存，常用 于未登陆的用户访问用户中心重定向到登录页面
- 304：协商缓存，告诉客户端有缓存，直接使用缓存中的数据，返回页面的只有头部信息，是没有内容部分
- 400：参数有误，请求无法被服务器识别
- 403：告诉客户端禁止访问该站点或者资源，如在外网环境下，然后访问只有内网IP才能访问的时候则返回
- 404：服务器找不到资源时，或者服务器拒绝请求又不想说明理由时
- 503：服务器停机维护时，主动用503响应请求或 nginx 设置限速，超过限速，会返回503
- 504：网关超时

### 参考文献

- https://zh.wikipedia.org/wiki/HTTP状态码
- https://kebingzao.com/2018/10/05/http-status-code/
- https://vue3js.cn/interview

## 10、说一下 GET 和 POST 的区别？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTQb8Pmxic6EiaqXqWyprzKmtLDUv2w3cBiamvlojScWof9Abiaqgdhjt7UkPf4vYSMyicNd3icaITiaCZbQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

`GET`和`POST`，两者是`HTTP`协议中发送请求的方法

#### GET

`GET`方法请求一个指定资源的表示形式，使用GET的请求应该只被用于获取数据

#### POST

`POST`方法用于将实体提交到指定的资源，通常导致在服务器上的状态变化或「副作用」

本质上都是`TCP`链接，并无差别

但是由于`HTTP`的规定和浏览器/服务器的限制，导致他们在应用过程中会体现出一些区别

### 二、区别

从`w3schools`得到的标准答案的区别如下：

- GET在浏览器回退时是无害的，而POST会再次提交请求。
- GET产生的URL地址可以被Bookmark，而POST不可以。
- GET请求会被浏览器主动cache，而POST不会，除非手动设置。
- GET请求只能进行url编码，而POST支持多种编码方式。
- GET请求参数会被完整保留在浏览器历史记录里，而POST中的参数不会被保留。
- GET请求在URL中传送的参数是有长度限制的，而POST没有。
- 对参数的数据类型，GET只接受ASCII字符，而POST没有限制。
- GET比POST更不安全，因为参数直接暴露在URL上，所以不能用来传递敏感信息。
- GET参数通过URL传递，POST放在Request body中

#### 参数位置

貌似从上面看到`GET`与`POST`请求区别非常大，但两者实质并没有区别

无论 `GET`还是 `POST`，用的都是同一个传输层协议，所以在传输上没有区别

当不携带参数的时候，两者最大的区别为第一行方法名不同

> ❝
>
> POST /uri HTTP/1.1 \r\n
>
> GET /uri HTTP/1.1 \r\n
>
> ❞

当携带参数的时候，我们都知道`GET`请求是放在`url`中，`POST`则放在`body`中

`GET` 方法简约版报文是这样的

```
GET /index.html?name=qiming.c&age=22 HTTP/1.1
Host: localhost
```

`POST`方法简约版报文是这样的

```
POST /index.html HTTP/1.1
Host: localhost
Content-Type: application/x-www-form-urlencoded

name=qiming.c&age=22
```

注意：这里只是约定，并不属于`HTTP`规范，相反的，我们可以在`POST`请求中`url`中写入参数，或者`GET`请求中的`body`携带参数

#### 参数长度

`HTTP`协议没有`Body`和 `URL` 的长度限制，对 `URL`限制的大多是浏览器和服务器的原因

`IE`对`URL`长度的限制是2083字节(2K+35)。对于其他浏览器，如Netscape、FireFox等，理论上没有长度限制，其限制取决于操作系统的支持

这里限制的是整个`URL`长度，而不仅仅是参数值的长度

服务器处理长`URL` 要消耗比较多的资源，为了性能和安全考虑，会给 `URL` 长度加限制

#### 安全

`POST`比`GET` 安全，因为数据在地址栏上不可见

然而，从传输的角度来说，他们都是不安全的，因为`HTTP` 在网络上是明文传输的，只要在网络节点上捉包，就能完整地获取数据报文

只有使用`HTTPS`才能加密安全

#### 数据包

对于`GET`方式的请求，浏览器会把`http header`和`data`一并发送出去，服务器响应200（返回数据）

对于`POST`，浏览器先发送`header`，服务器响应100 `continue`，浏览器再发送`data`，服务器响应200 ok

注意：并不是所有浏览器都会在`POST`中发送两次包，`Firefox`就只发送一次

### 参考文献

- https://mp.weixin.qq.com/s?__biz=MzI3NzIzMzg3Mw==&mid=100000054&idx=1&sn=71f6c214f3833d9ca20b9f7dcd9d33e4#rd
- https://blog.fundebug.com/2019/02/22/compare-http-method-get-and-post/
- https://www.w3school.com.cn/tags/html_ref_httpmethods.asp
- https://vue3js.cn/interview

## 11、说说 HTTP 常见的请求头有哪些? 作用？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRiaKhPPrjWNvVrXmSHur8rH2BzOpMjBv24N8qk6WGK60wZib5usK91RpPKicsP4Yo9oCus64Mg7vib8w/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

HTTP头字段（HTTP header fields）,是指在超文本传输协议（HTTP）的请求和响应消息中的消息头部分

它们定义了一个超文本传输协议事务中的操作参数

HTTP头部字段可以自己根据需要定义，因此可能在 `Web`服务器和浏览器上发现非标准的头字段

下面是一个`HTTP`请求的请求头：

```
GET /home.html HTTP/1.1
Host: developer.mozilla.org
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:50.0) Gecko/20100101 Firefox/50.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: https://developer.mozilla.org/testpage.html
Connection: keep-alive
Upgrade-Insecure-Requests: 1
If-Modified-Since: Mon, 18 Jul 2016 02:36:04 GMT
If-None-Match: "c561c68d0ba92bbeb8b0fff2a9199f722e3a621a"
Cache-Control: max-age=0
```

### 二、分类

常见的请求字段如下表所示：

| 字段名            | 说明                                                         | 示例                                                         |
| :---------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| Accept            | 能够接受的回应内容类型（Content-Types）                      | Accept: text/plain                                           |
| Accept-Charset    | 能够接受的字符集                                             | Accept-Charset: utf-8                                        |
| Accept-Encoding   | 能够接受的编码方式列表                                       | Accept-Encoding: gzip, deflate                               |
| Accept-Language   | 能够接受的回应内容的自然语言列表                             | Accept-Language: en-US                                       |
| Authorization     | 用于超文本传输协议的认证的认证信息                           | Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==            |
| Cache-Control     | 用来指定在这次的请求/响应链中的所有缓存机制 都必须 遵守的指令 | Cache-Control: no-cache                                      |
| Connection        | 该浏览器想要优先使用的连接类型                               | Connection: keep-alive Connection: Upgrade                   |
| Cookie            | 服务器通过 Set- Cookie （下文详述）发送的一个 超文本传输协议Cookie | Cookie: $Version=1; Skin=new;                                |
| Content-Length    | 以 八位字节数组 （8位的字节）表示的请求体的长度              | Content-Length: 348                                          |
| Content-Type      | 请求体的 多媒体类型                                          | Content-Type: application/x-www-form-urlencoded              |
| Date              | 发送该消息的日期和时间                                       | Date: Tue, 15 Nov 1994 08:12:31 GMT                          |
| Expect            | 表明客户端要求服务器做出特定的行为                           | Expect: 100-continue                                         |
| Host              | 服务器的域名(用于虚拟主机 )，以及服务器所监听的传输控制协议端口号 | Host: en.wikipedia.org:80 Host: en.wikipedia.org             |
| If-Match          | 仅当客户端提供的实体与服务器上对应的实体相匹配时，才进行对应的操作。主要作用时，用作像 PUT 这样的方法中，仅当从用户上次更新某个资源以来，该资源未被修改的情况下，才更新该资源 | If-Match: "737060cd8c284d8af7ad3082f209582d"                 |
| If-Modified-Since | 允许在对应的内容未被修改的情况下返回304未修改                | If-Modified-Since: Sat, 29 Oct 1994 19:43:31 GMT             |
| If-None-Match     | 允许在对应的内容未被修改的情况下返回304未修改                | If-None-Match: "737060cd8c284d8af7ad3082f209582d"            |
| If-Range          | 如果该实体未被修改过，则向我发送我所缺少的那一个或多个部分；否则，发送整个新的实体 | If-Range: "737060cd8c284d8af7ad3082f209582d"                 |
| Range             | 仅请求某个实体的一部分                                       | Range: bytes=500-999                                         |
| User-Agent        | 浏览器的浏览器身份标识字符串                                 | User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/21.0 |
| Origin            | 发起一个针对 跨来源资源共享 的请求                           | Origin: http://www.example-social-network.com                |

### 三、使用场景

通过配合请求头和响应头，可以满足一些场景的功能实现：

#### 协商缓存

协商缓存是利用的是`【Last-Modified，If-Modified-Since】`和`【ETag、If-None-Match】`这两对请求头响应头来管理的

`Last-Modified` 表示本地文件最后修改日期，浏览器会在request header加上`If-Modified-Since`（上次返回的`Last-Modified`的值），询问服务器在该日期后资源是否有更新，有更新的话就会将新的资源发送回来

`Etag`就像一个指纹，资源变化都会导致`ETag`变化，跟最后修改时间没有关系，`ETag`可以保证每一个资源是唯一的

`If-None-Match`的header会将上次返回的`Etag`发送给服务器，询问该资源的`Etag`是否有更新，有变动就会发送新的资源回来

而强制缓存不需要发送请求到服务端，根据请求头`expires`和`cache-control`判断是否命中强缓存

强制缓存与协商缓存的流程图如下所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRiaKhPPrjWNvVrXmSHur8rHbQFG2rwQjJ2nMic34A4z4zicpN60sgciarfXMgria9AlqSibF9orYNfmICg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 会话状态

`cookie`，类型为「小型文本文件」，指某些网站为了辨别用户身份而储存在用户本地终端上的数据，通过响应头`set-cookie`决定

作为一段一般不超过 4KB 的小型文本数据，它由一个名称（Name）、一个值（Value）和其它几个用于控制 `Cookie`有效期、安全性、使用范围的可选属性组成

`Cookie` 主要用于以下三个方面：

- 会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）
- 个性化设置（如用户自定义设置、主题等）
- 浏览器行为跟踪（如跟踪分析用户行为等

###### [cookie 和session 的区别详解](https://www.cnblogs.com/shiyangxt/articles/1305506.html)

这些都是基础知识，不过有必要做深入了解。先简单介绍一下。

二者的定义：

当你在浏览网站的时候，WEB 服务器会先送一小小资料放在你的计算机上，Cookie 会帮你在网站上所打的文字或是一些选择，

都纪录下来。当下次你再光临同一个网站，WEB 服务器会先看看有没有它上次留下的 Cookie 资料，有的话，就会依据 Cookie

里的内容来判断使用者，送出特定的网页内容给你。 Cookie 的使用很普遍，许多有提供个人化服务的网站，都是利用 Cookie

来辨认使用者，以方便送出使用者量身定做的内容，像是 Web 接口的免费 email 网站，都要用到 Cookie。


具体来说cookie机制采用的是在客户端保持状态的方案，而session机制采用的是在服务器端保持状态的方案。

同时我们也看到，由于采用服务器端保持状态的方案在客户端也需要保存一个标识，所以session机制可能需要借助于cookie机制

来达到保存标识的目的，但实际上它还有其他选择。

cookie机制。正统的cookie分发是通过扩展HTTP协议来实现的，服务器通过在HTTP的响应头中加上一行特殊的指示以提示

浏览器按照指示生成相应的cookie。然而纯粹的客户端脚本如JavaScript或者VBScript也可以生成cookie。而cookie的使用

是由浏览器按照一定的原则在后台自动发送给服务器的。浏览器检查所有存储的cookie，如果某个cookie所声明的作用范围

大于等于将要请求的资源所在的位置，则把该cookie附在请求资源的HTTP请求头上发送给服务器。
 
cookie的内容主要包括：名字，值，过期时间，路径和域。路径与域一起构成cookie的作用范围。若不设置过期时间，则表示这

个cookie的生命期为浏览器会话期间，关闭浏览器窗口，cookie就消失。这种生命期为浏览器会话期的cookie被称为会话cookie。

会话cookie一般不存储在硬盘上而是保存在内存里，当然这种行为并不是规范规定的。若设置了过期时间，浏览器就会把cookie

保存到硬盘上，关闭后再次打开浏览器，这些cookie仍然有效直到超过设定的过期时间。存储在硬盘上的cookie可以在不同的浏

览器进程间共享，比如两个IE窗口。而对于保存在内存里的cookie，不同的浏览器有不同的处理方式

session机制。session机制是一种服务器端的机制，服务器使用一种类似于散列表的结构（也可能就是使用散列表）来保存信息。

​     当程序需要为某个客户端的请求创建一个session时，服务器首先检查这个客户端的请求里是否已包含了一个session标识

（称为session id），如果已包含则说明以前已经为此客户端创建过session，服务器就按照session id把这个session检索出来

使用（检索不到，会新建一个），如果客户端请求不包含session id，则为此客户端创建一个session并且生成一个与此session相

关联的session id，session id的值应该是一个既不会重复，又不容易被找到规律以仿造的字符串，这个session id将被在本次响应

中返回给客户端保存。保存这个session id的方式可以采用cookie，这样在交互过程中浏览器可以自动的按照规则把这个标识发送给

服务器。一般这个cookie的名字都是类似于SEEESIONID。但cookie可以被人为的禁止，则必须有其他机制以便在cookie被禁止时

仍然能够把session id传递回服务器。

经常被使用的一种技术叫做URL重写，就是把session id直接附加在URL路径的后面。还有一种技术叫做表单隐藏字段。就是服务器

会自动修改表单，添加一个隐藏字段，以便在表单提交时能够把session id传递回服务器。比如： 
<form name="testform" action="/xxx"> 
<input type="hidden" name="jsessionid" value="ByOK3vjFD75aPnrF7C2HmdnV6QZcEbzWoWiBYEnLerjQ99zWpBng!-145788764"> 
<input type="text"> 
</form> 
实际上这种技术可以简单的用对action应用URL重写来代替。

cookie 和session 的区别：

1、cookie数据存放在客户的浏览器上，session数据放在服务器上。

2、cookie不是很安全，别人可以分析存放在本地的COOKIE并进行COOKIE欺骗
  考虑到安全应当使用session。

3、session会在一定时间内保存在服务器上。当访问增多，会比较占用你服务器的性能
  考虑到减轻服务器性能方面，应当使用COOKIE。

4、单个cookie保存的数据不能超过4K，很多浏览器都限制一个站点最多保存20个cookie。

5、所以个人建议：
  将登陆信息等重要信息存放为SESSION
  其他信息如果需要保留，可以放在COOKIE中

### 参考文献

- https://zh.wikipedia.org/wiki/HTTP头字段
- https://github.com/amandakelake/blog/issues/41

## 12、说说地址栏输入 URL 敲下回车后发生了什么?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSTR1KCaM1nUSzrQoUicIrAjsOdwicw15gcp1gFz9bYEweYnz7PTK1xLbLBwktx8YZKDwkogpJxN4og/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、简单分析

简单的分析，从输入 `URL`到回车后发生的行为如下：

- URL解析
- DNS 查询
- TCP 连接
- HTTP 请求
- 响应请求
- 页面渲染

### 二、详细分析

#### URL解析

首先判断你输入的是一个合法的`URL` 还是一个待搜索的关键词，并且根据你输入的内容进行对应操作

一个`url`的结构解析如下：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSTR1KCaM1nUSzrQoUicIrAjrSWeIvqlBob4lo58oNAAUjJ2PR8E50jHLHcV3a7GknibcDTsLrsSicQQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### DNS查询

在之前[文章](http://mp.weixin.qq.com/s?__biz=MzU1OTgxNDQ1Nw==&mid=2247487550&idx=2&sn=97dc4d681907edae054b0842c07aaf6e&chksm=fc10d268cb675b7e2d269b684cb3395b61d8bc2bac377734e50b43d55e7323a57fbfd889bbf3&scene=21#wechat_redirect)中讲过`DNS`的查询，这里就不再讲述了

整个查询过程如下图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSTR1KCaM1nUSzrQoUicIrAjHnGoiavvm9RkUnMvn3vz2byeB4Mcfu5mC6buNicyXL9gSZMQRjBH6AUg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

最终，获取到了域名对应的目标服务器`IP`地址

#### TCP连接

在之前[文章](http://mp.weixin.qq.com/s?__biz=MzU1OTgxNDQ1Nw==&mid=2247487527&idx=2&sn=3be899f39102e058cdf2cde028bf6c0c&chksm=fc10d271cb675b678d5fc4b8b8267352b6c3ddbb2130d26527a61374bf72277d7f046ea9597d&scene=21#wechat_redirect)中，了解到`tcp`是一种面向有连接的传输层协议

在确定目标服务器服务器的`IP`地址后，则经历三次握手建立`TCP`连接，流程如下：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSTR1KCaM1nUSzrQoUicIrAjGlGlHqcMp4juMQc8c8MoZ5tLgljaSe0Bd4mjMkHTxN9ibFAOw806yVQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 发送 http 请求

当建立`tcp`连接之后，就可以在这基础上进行通信，浏览器发送 `http` 请求到目标服务器

请求的内容包括：

- 请求行
- 请求头
- 请求主体

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSTR1KCaM1nUSzrQoUicIrAjkPb9aRmAepzo58S35eGgicygI6tUuPprnPHicbQeicEvSvG6ystCTgKTw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 响应请求

当服务器接收到浏览器的请求之后，就会进行逻辑操作，处理完成之后返回一个`HTTP`响应消息，包括：

- 状态行
- 响应头
- 响应正文

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSTR1KCaM1nUSzrQoUicIrAjtMMht7CxGUQFnw3glRdFicEaDargeFwo0iaWqdoIauNpylhWLb4NBHiaQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在服务器响应之后，由于现在`http`默认开始长连接`keep-alive`，当页面关闭之后，`tcp`链接则会经过四次挥手完成断开

#### 页面渲染

当浏览器接收到服务器响应的资源后，首先会对资源进行解析：

- 查看响应头的信息，根据不同的指示做对应处理，比如重定向，存储cookie，解压gzip，缓存资源等等
- 查看响应头的 Content-Type的值，根据不同的资源类型采用不同的解析方式

关于页面的渲染过程如下：

- 解析HTML，构建 DOM 树
- 解析 CSS ，生成 CSS 规则树
- 合并 DOM 树和 CSS 规则，生成 render 树
- 布局 render 树（ Layout / reflow ），负责各元素尺寸、位置的计算
- 绘制 render 树（ paint ），绘制页面像素信息
- 浏览器会将各层的信息发送给 GPU，GPU 会将各层合成（ composite ），显示在屏幕上

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSTR1KCaM1nUSzrQoUicIrAjccXNpFMPG2eFLNwgxZ5d5OdZ6LExktwAB8R6azTSicbq9V3I7HQ1QSQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 参考文献

- https://github.com/febobo/web-interview/issues/141
- https://zhuanlan.zhihu.com/p/80551769

## 13、说说TCP为什么需要三次握手和四次挥手？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQHPC0FqPrv2ic9lqMsyIib2bqZYVBeGJuUZyPX8GBQBtKjCBuM7icjkl25O6gB6dWib2F7AWTXxhNnkA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、三次握手

三次握手（Three-way Handshake）其实就是指建立一个TCP连接时，需要客户端和服务器总共发送3个包

主要作用就是为了确认双方的接收能力和发送能力是否正常、指定自己的初始化序列号为后面的可靠性传送做准备

过程如下：

- 第一次握手：客户端给服务端发一个 SYN 报文，并指明客户端的初始化序列号 ISN(c)，此时客户端处于  SYN_SENT 状态
- 第二次握手：服务器收到客户端的 SYN 报文之后，会以自己的 SYN 报文作为应答，为了确认客户端的 SYN，将客户端的 ISN+1作为ACK的值，此时服务器处于 SYN_RCVD  的状态
- 第三次握手：客户端收到 SYN 报文之后，会发送一个 ACK 报文，值为服务器的ISN+1。此时客户端处于 ESTABLISHED 状态。服务器收到 ACK 报文之后，也处于 ESTABLISHED  状态，此时，双方已建立起了连接

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQHPC0FqPrv2ic9lqMsyIib2boPHeS5ia7RTsj9ibvX0bsGJ53pcQ9XmTRhRcfpmQ2KAlfpUGSZSHoqZw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

上述每一次握手的作用如下：

- 第一次握手：客户端发送网络包，服务端收到了 这样服务端就能得出结论：客户端的发送能力、服务端的接收能力是正常的。
- 第二次握手：服务端发包，客户端收到了 这样客户端就能得出结论：服务端的接收、发送能力，客户端的接收、发送能力是正常的。不过此时服务器并不能确认客户端的接收能力是否正常
- 第三次握手：客户端发包，服务端收到了。这样服务端就能得出结论：客户端的接收、发送能力正常，服务器自己的发送、接收能力也正常

通过三次握手，就能确定双方的接收和发送能力是正常的。之后就可以正常通信了

#### 为什么不是两次握手?

如果是两次握手，发送端可以确定自己发送的信息能对方能收到，也能确定对方发的包自己能收到，但接收端只能确定对方发的包自己能收到 无法确定自己发的包对方能收到

并且两次握手的话, 客户端有可能因为网络阻塞等原因会发送多个请求报文，延时到达的请求又会与服务器建立连接，浪费掉许多服务器的资源

### 二、四次挥手

`tcp`终止一个连接，需要经过四次挥手

过程如下：

- 第一次挥手：客户端发送一个 FIN 报文，报文中会指定一个序列号。此时客户端处于  FIN_WAIT1 状态，停止发送数据，等待服务端的确认
- 第二次挥手：服务端收到 FIN 之后，会发送 ACK 报文，且把客户端的序列号值 +1 作为 ACK 报文的序列号值，表明已经收到客户端的报文了，此时服务端处于 CLOSE_WAIT状态
- 第三次挥手：如果服务端也想断开连接了，和客户端的第一次挥手一样，发给 FIN 报文，且指定一个序列号。此时服务端处于 `LAST_ACK` 的状态
- 第四次挥手：客户端收到 FIN 之后，一样发送一个 ACK 报文作为应答，且把服务端的序列号值 +1 作为自己 ACK 报文的序列号值，此时客户端处于 TIME_WAIT状态。需要过一阵子以确保服务端收到自己的 ACK 报文之后才会进入 CLOSED 状态，服务端收到 ACK 报文之后，就处于关闭连接了，处于 CLOSED 状态

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQHPC0FqPrv2ic9lqMsyIib2bhGKQAJGLUvBsguiaJJzs2CZalN17AQicttV0Sib2icNibWeTzQneE0W8lVg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 四次挥手原因

服务端在收到客户端断开连接`Fin`报文后，并不会立即关闭连接，而是先发送一个`ACK`包先告诉客户端收到关闭连接的请求，只有当服务器的所有报文发送完毕之后，才发送`FIN`报文断开连接，因此需要四次挥手

### 三、总结

一个完整的三次握手四次挥手如下图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQHPC0FqPrv2ic9lqMsyIib2bEZReveiaNz9AjhxhBzc6EpO29RSYxpt1Q4MFUoGhEqK4uhDSQTYb5jg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 参考文献

- https://zhuanlan.zhihu.com/p/53374516
- https://segmentfault.com/a/1190000020610336

## 14、说说对WebSocket的理解？应用场景？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRicPlgTdzd4YvEcvQuNKrsC6JNBKKdH0g3XswqzibhP6SicTazjE28P68heLvtibKWhzZnA9QjubQib7A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

WebSocket，是一种网络传输协议，位于`OSI`模型的应用层。可在单个`TCP`连接上进行全双工通信，能更好的节省服务器资源和带宽并达到实时通迅

客户端和服务器只需要完成一次握手，两者之间就可以创建持久性的连接，并进行双向数据传输

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRicPlgTdzd4YvEcvQuNKrsCwGN5CMmlGDnyVESC1f8xNgQdlk3kQBI9HdsK4CqzVdBGvVl65n3urQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

从上图可见，`websocket`服务器与客户端通过握手连接，连接成功后，两者都能主动的向对方发送或接受数据

而在`websocket`出现之前，开发实时`web`应用的方式为轮询

不停地向服务器发送 HTTP 请求，问有没有数据，有数据的话服务器就用响应报文回应。如果轮询的频率比较高，那么就可以近似地实现“实时通信”的效果

轮询的缺点也很明显，反复发送无效查询请求耗费了大量的带宽和 `CPU`资源

### 二、特点

#### 全双工

通信允许数据在两个方向上同时传输，它在能力上相当于两个单工通信方式的结合

例如指 A→B 的同时 B→A ，是瞬时同步的

#### 二进制帧

采用了二进制帧结构，语法、语义与 HTTP 完全不兼容，相比`http/2`，`WebSocket`更侧重于“实时通信”，而`HTTP/2` 更侧重于提高传输效率，所以两者的帧结构也有很大的区别

不像 `HTTP/2` 那样定义流，也就不存在多路复用、优先级等特性

自身就是全双工，也不需要服务器推送

#### 协议名

引入`ws`和`wss`分别代表明文和密文的`websocket`协议，且默认端口使用80或443，几乎与`http`一致

```
ws://www.chrono.com
ws://www.chrono.com:8080/srv
wss://www.chrono.com:445/im?user_id=xxx
```

#### 握手

`WebSocket`也要有一个握手过程，然后才能正式收发数据

客户端发送数据格式如下：

```
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Origin: http://example.com
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Version: 13
```

- Connection：必须设置Upgrade，表示客户端希望连接升级
- Upgrade：必须设置Websocket，表示希望升级到Websocket协议
- Sec-WebSocket-Key：客户端发送的一个 base64 编码的密文，用于简单的认证秘钥。要求服务端必须返回一个对应加密的“Sec-WebSocket-Accept应答，否则客户端会抛出错误，并关闭连接
- Sec-WebSocket-Version ：表示支持的Websocket版本

服务端返回的数据格式：

```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=Sec-WebSocket-Protocol: chat
```

- HTTP/1.1 101 Switching Protocols：表示服务端接受 WebSocket 协议的客户端连接
- Sec-WebSocket-Accep：验证客户端请求报文，同样也是为了防止误连接。具体做法是把请求头里“Sec-WebSocket-Key”的值，加上一个专用的 UUID，再计算摘要

#### 优点

- 较少的控制开销：数据包头部协议较小，不同于http每次请求需要携带完整的头部
- 更强的实时性：相对于HTTP请求需要等待客户端发起请求服务端才能响应，延迟明显更少
- 保持创连接状态：创建通信后，可省略状态信息，不同于HTTP每次请求需要携带身份验证
- 更好的二进制支持：定义了二进制帧，更好处理二进制内容
- 支持扩展：用户可以扩展websocket协议、实现部分自定义的子协议
- 更好的压缩效果：Websocket在适当的扩展支持下，可以沿用之前内容的上下文，在传递类似的数据时，可以显著地提高压缩率

### 二、应用场景

基于`websocket`的事实通信的特点，其存在的应用场景大概有：

- 弹幕
- 媒体聊天
- 协同编辑
- 基于位置的应用
- 体育实况更新
- 股票基金报价实时更新

### 参考文献

- https://zh.wikipedia.org/wiki/WebSocket
- https://www.oschina.net/translate/9-killer-uses-for-websockets
- https://vue3js.cn/interview

# 五、ES6

## 1、说说var、let、const之间的区别

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQB1kqOlECu15gmJTUB3AsjN6rqV5ic6jcy44TP9Zug7KXJsgAl82iauJnYmXtHS026W0k2V9oaFm6w/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、var

在ES5中，顶层对象的属性和全局变量是等价的，用`var`声明的变量既是全局变量，也是顶层变量

注意：顶层对象，在浏览器环境指的是`window`对象，在 `Node` 指的是`global`对象

```
var a = 10;
console.log(window.a) // 10
```

使用`var`声明的变量存在变量提升的情况

```
console.log(a) // undefined
var a = 20
```

在编译阶段，编译器会将其变成以下执行

```
var a
console.log(a)
a = 20
```

使用`var`，我们能够对一个变量进行多次声明，后面声明的变量会覆盖前面的变量声明

```
var a = 20 
var a = 30
console.log(a) // 30
```

在函数中使用使用`var`声明变量时候，该变量是局部的

```
var a = 20
function change(){
    var a = 30
}
change()
console.log(a) // 20 
```

而如果在函数内不使用`var`，该变量是全局的

```
var a = 20
function change(){
   a = 30
}
change()
console.log(a) // 30 
```

### 二、let

`let`是`ES6`新增的命令，用来声明变量

用法类似于`var`，但是所声明的变量，只在`let`命令所在的代码块内有效

```
{
    let a = 20
}
console.log(a) // ReferenceError: a is not defined.
```

不存在变量提升

```
console.log(a) // 报错ReferenceError
let a = 2
```

这表示在声明它之前，变量`a`是不存在的，这时如果用到它，就会抛出一个错误

只要块级作用域内存在`let`命令，这个区域就不再受外部影响

```
var a = 123
if (true) {
    a = 'abc' // ReferenceError
    let a;
}
```

使用`let`声明变量前，该变量都不可用，也就是大家常说的“暂时性死区”

最后，`let`不允许在相同作用域中重复声明

```
let a = 20
let a = 30
// Uncaught SyntaxError: Identifier 'a' has already been declared
```

注意的是相同作用域，下面这种情况是不会报错的

```
let a = 20
{
    let a = 30
}
```

因此，我们不能在函数内部重新声明参数

```
function func(arg) {
  let arg;
}
func()
// Uncaught SyntaxError: Identifier 'arg' has already been declared
```

### 三、const

`const`声明一个只读的常量，一旦声明，常量的值就不能改变

```
const a = 1
a = 3
// TypeError: Assignment to constant variable.
```

这意味着，`const`一旦声明变量，就必须立即初始化，不能留到以后赋值

```
const a;
// SyntaxError: Missing initializer in const declaration
```

如果之前用`var`或`let`声明过变量，再用`const`声明同样会报错

```
var a = 20
let b = 20
const a = 30
const b = 30
// 都会报错
```

`const`实际上保证的并不是变量的值不得改动，而是变量指向的那个内存地址所保存的数据不得改动

对于简单类型的数据，值就保存在变量指向的那个内存地址，因此等同于常量

对于复杂类型的数据，变量指向的内存地址，保存的只是一个指向实际数据的指针，`const`只能保证这个指针是固定的，并不能确保改变量的结构不变

```
const foo = {};

// 为 foo 添加一个属性，可以成功
foo.prop = 123;
foo.prop // 123

// 将 foo 指向另一个对象，就会报错
foo = {}; // TypeError: "foo" is read-only
```

其它情况，`const`与`let`一致

### 四、区别

`var`、`let`、`const`三者区别可以围绕下面五点展开：

- 变量提升
- 暂时性死区
- 块级作用域
- 重复声明
- 修改声明的变量
- 使用

#### 变量提升

```
var`声明的变量存在变量提升，即变量可以在声明之前调用，值为`undefined
```

`let`和`const`不存在变量提升，即它们所声明的变量一定要在声明后使用，否则报错

```
// var
console.log(a)  // undefined
var a = 10

// let 
console.log(b)  // Cannot access 'b' before initialization
let b = 10

// const
console.log(c)  // Cannot access 'c' before initialization
const c = 10
```

#### 暂时性死区

`var`不存在暂时性死区

`let`和`const`存在暂时性死区，只有等到声明变量的那一行代码出现，才可以获取和使用该变量

```
// var
console.log(a)  // undefined
var a = 10

// let
console.log(b)  // Cannot access 'b' before initialization
let b = 10

// const
console.log(c)  // Cannot access 'c' before initialization
const c = 10
```

#### 块级作用域

`var`不存在块级作用域

`let`和`const`存在块级作用域

```
// var
{
    var a = 20
}
console.log(a)  // 20

// let
{
    let b = 20
}
console.log(b)  // Uncaught ReferenceError: b is not defined

// const
{
    const c = 20
}
console.log(c)  // Uncaught ReferenceError: c is not defined
```

#### 重复声明

`var`允许重复声明变量

`let`和`const`在同一作用域不允许重复声明变量

```
// var
var a = 10
var a = 20 // 20

// let
let b = 10
let b = 20 // Identifier 'b' has already been declared

// const
const c = 10
const c = 20 // Identifier 'c' has already been declared
```

#### 修改声明的变量

`var`和`let`可以

`const`声明一个只读的常量。一旦声明，常量的值就不能改变

```
// var
var a = 10
a = 20
console.log(a)  // 20

//let
let b = 10
b = 20
console.log(b)  // 20

// const
const c = 10
c = 20
console.log(c) // Uncaught TypeError: Assignment to constant variable
```

#### 使用

能用`const`的情况尽量使用`const`，其他情况下大多数使用`let`，避免使用`var`

### 参考文献

- https://es6.ruanyifeng.com/

## 2、ES6中数组新增了哪些扩展?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS3f85icaibsWOYxK5nhzfoeBunSokD2BHPjvRib4kUPHJJoVibkU71bmoYoibR7lYQGOw3RSYWzZdUNBw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、扩展运算符的应用

ES6通过扩展元素符`...`，好比 `rest` 参数的逆运算，将一个数组转为用逗号分隔的参数序列

```
console.log(...[1, 2, 3])
// 1 2 3

console.log(1, ...[2, 3, 4], 5)
// 1 2 3 4 5

[...document.querySelectorAll('div')]
// [<div>, <div>, <div>]
```

主要用于函数调用的时候，将一个数组变为参数序列

```
function push(array, ...items) {
  array.push(...items);
}

function add(x, y) {
  return x + y;
}

const numbers = [4, 38];
add(...numbers) // 42
```

可以将某些数据结构转为数组

```
[...document.querySelectorAll('div')]
```

能够更简单实现数组复制

```
const a1 = [1, 2];
const [...a2] = a1;
// [1,2]
```

数组的合并也更为简洁了

```
const arr1 = ['a', 'b'];
const arr2 = ['c'];
const arr3 = ['d', 'e'];
[...arr1, ...arr2, ...arr3]
// [ 'a', 'b', 'c', 'd', 'e' ]
```

注意：通过扩展运算符实现的是浅拷贝，修改了引用指向的值，会同步反映到新数组

下面看个例子就清楚多了

```
const arr1 = ['a', 'b',[1,2]];
const arr2 = ['c'];
const arr3  = [...arr1,...arr2]
arr[1][0] = 9999 // 修改arr1里面数组成员值
console.log(arr[3]) // 影响到arr3,['a','b',[9999,2],'c']
```

扩展运算符可以与解构赋值结合起来，用于生成数组

```
const [first, ...rest] = [1, 2, 3, 4, 5];
first // 1
rest  // [2, 3, 4, 5]

const [first, ...rest] = [];
first // undefined
rest  // []

const [first, ...rest] = ["foo"];
first  // "foo"
rest   // []
```

如果将扩展运算符用于数组赋值，只能放在参数的最后一位，否则会报错

```
const [...butLast, last] = [1, 2, 3, 4, 5];
// 报错

const [first, ...middle, last] = [1, 2, 3, 4, 5];
// 报错
```

可以将字符串转为真正的数组

```
[...'hello']
// [ "h", "e", "l", "l", "o" ]
```

定义了遍历器（Iterator）接口的对象，都可以用扩展运算符转为真正的数组

```
let nodeList = document.querySelectorAll('div');
let array = [...nodeList];

let map = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
]);

let arr = [...map.keys()]; // [1, 2, 3]
```

如果对没有 Iterator 接口的对象，使用扩展运算符，将会报错

```
const obj = {a: 1, b: 2};
let arr = [...obj]; // TypeError: Cannot spread non-iterable object
```

### 二、构造函数新增的方法

关于构造函数，数组新增的方法有如下：

- Array.from()
- Array.of()

#### Array.from()

将两类对象转为真正的数组：类似数组的对象和可遍历`（iterable）`的对象（包括 `ES6` 新增的数据结构 `Set` 和 `Map`）

```
let arrayLike = {
    '0': 'a',
    '1': 'b',
    '2': 'c',
    length: 3
};
let arr2 = Array.from(arrayLike); // ['a', 'b', 'c']
```

还可以接受第二个参数，用来对每个元素进行处理，将处理后的值放入返回的数组

```
Array.from([1, 2, 3], (x) => x * x)
// [1, 4, 9]
```

#### Array.of()

用于将一组值，转换为数组

```
Array.of(3, 11, 8) // [3,11,8]
```

没有参数的时候，返回一个空数组

当参数只有一个的时候，实际上是指定数组的长度

参数个数不少于 2 个时，`Array()`才会返回由参数组成的新数组

```
Array() // []
Array(3) // [, , ,]
Array(3, 11, 8) // [3, 11, 8]
```

### 三、实例对象新增的方法

关于数组实例对象新增的方法有如下：

- copyWithin()
- find()、findIndex()
- fill()
- entries()，keys()，values()
- includes()
- flat()，flatMap()

#### copyWithin()

将指定位置的成员复制到其他位置（会覆盖原有成员），然后返回当前数组

参数如下：

- target（必需）：从该位置开始替换数据。如果为负值，表示倒数。
- start（可选）：从该位置开始读取数据，默认为 0。如果为负值，表示从末尾开始计算。
- end（可选）：到该位置前停止读取数据，默认等于数组长度。如果为负值，表示从末尾开始计算。

```
[1, 2, 3, 4, 5].copyWithin(0, 3) // 将从 3 号位直到数组结束的成员（4 和 5），复制到从 0 号位开始的位置，结果覆盖了原来的 1 和 2
// [4, 5, 3, 4, 5] 
```

#### find()、findIndex()

`find()`用于找出第一个符合条件的数组成员

参数是一个回调函数，接受三个参数依次为当前的值、当前的位置和原数组

```
[1, 5, 10, 15].find(function(value, index, arr) {
  return value > 9;
}) // 10
findIndex`返回第一个符合条件的数组成员的位置，如果所有成员都不符合条件，则返回`-1
[1, 5, 10, 15].findIndex(function(value, index, arr) {
  return value > 9;
}) // 2
```

这两个方法都可以接受第二个参数，用来绑定回调函数的`this`对象。

```
function f(v){
  return v > this.age;
}
let person = {name: 'John', age: 20};
[10, 12, 26, 15].find(f, person);    // 26
```

#### fill()

使用给定值，填充一个数组

```
['a', 'b', 'c'].fill(7)
// [7, 7, 7]

new Array(3).fill(7)
// [7, 7, 7]
```

还可以接受第二个和第三个参数，用于指定填充的起始位置和结束位置

```
['a', 'b', 'c'].fill(7, 1, 2)
// ['a', 7, 'c']
```

注意，如果填充的类型为对象，则是浅拷贝

#### entries()，keys()，values()

`keys()`是对键名的遍历、`values()`是对键值的遍历，`entries()`是对键值对的遍历

```
or (let index of ['a', 'b'].keys()) {
  console.log(index);
}
// 0
// 1

for (let elem of ['a', 'b'].values()) {
  console.log(elem);
}
// 'a'
// 'b'

for (let [index, elem] of ['a', 'b'].entries()) {
  console.log(index, elem);
}
// 0 "a"
```

#### includes()

用于判断数组是否包含给定的值

```
[1, 2, 3].includes(2)     // true
[1, 2, 3].includes(4)     // false
[1, 2, NaN].includes(NaN) // true
```

方法的第二个参数表示搜索的起始位置，默认为`0`

参数为负数则表示倒数的位置

```
[1, 2, 3].includes(3, 3);  // false
[1, 2, 3].includes(3, -1); // true
```

#### flat()，flatMap()

将数组扁平化处理，返回一个新数组，对原数据没有影响

```
[1, 2, [3, 4]].flat()
// [1, 2, 3, 4]
```

`flat()`默认只会“拉平”一层，如果想要“拉平”多层的嵌套数组，可以将`flat()`方法的参数写成一个整数，表示想要拉平的层数，默认为1

```
[1, 2, [3, [4, 5]]].flat()
// [1, 2, 3, [4, 5]]

[1, 2, [3, [4, 5]]].flat(2)
// [1, 2, 3, 4, 5]
```

`flatMap()`方法对原数组的每个成员执行一个函数相当于执行`Array.prototype.map()`，然后对返回值组成的数组执行`flat()`方法。该方法返回一个新数组，不改变原数组

```
// 相当于 [[2, 4], [3, 6], [4, 8]].flat()
[2, 3, 4].flatMap((x) => [x, x * 2])
// [2, 4, 3, 6, 4, 8]
flatMap()`方法还可以有第二个参数，用来绑定遍历函数里面的`this
```

### 四、数组的空位

数组的空位指，数组的某一个位置没有任何值

ES6 则是明确将空位转为`undefined`，包括`Array.from`、扩展运算符、`copyWithin()`、`fill()`、`entries()`、`keys()`、`values()`、`find()`和`findIndex()`

建议大家在日常书写中，避免出现空位

### 五、排序稳定性

将`sort()`默认设置为稳定的排序算法

```
const arr = [
  'peach',
  'straw',
  'apple',
  'spork'
];

const stableSorting = (s1, s2) => {
  if (s1[0] < s2[0]) return -1;
  return 1;
};

arr.sort(stableSorting)
// ["apple", "peach", "straw", "spork"]
```

排序结果中，`straw`在`spork`的前面，跟原始顺序一致

### 参考文献

- https://es6.ruanyifeng.com/#docs/array

## 3、ES6中对象新增了哪些扩展?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSicUpLLHibKmhwGISaYicSlPfHTQGGxwkWrhmS4bFy8A56D4YqNYmpbad4M7zY5RuiadJQFpBv19gphw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、属性的简写

ES6中，当对象键名与对应值名相等的时候，可以进行简写

```
const baz = {foo:foo}

// 等同于
const baz = {foo}
```

方法也能够进行简写

```
const o = {
  method() {
    return "Hello!";
  }
};

// 等同于

const o = {
  method: function() {
    return "Hello!";
  }
}
```

在函数内作为返回值，也会变得方便很多

```
function getPoint() {
  const x = 1;
  const y = 10;
  return {x, y};
}

getPoint()
// {x:1, y:10}
```

注意：简写的对象方法不能用作构造函数，否则会报错

```
const obj = {
  f() {
    this.foo = 'bar';
  }
};

new obj.f() // 报错
```

### 二、属性名表达式

ES6 允许字面量定义对象时，将表达式放在括号内

```
let lastWord = 'last word';

const a = {
  'first word': 'hello',
  [lastWord]: 'world'
};

a['first word'] // "hello"
a[lastWord] // "world"
a['last word'] // "world"
```

表达式还可以用于定义方法名

```
let obj = {
  ['h' + 'ello']() {
    return 'hi';
  }
};

obj.hello() // hi
```

注意，属性名表达式与简洁表示法，不能同时使用，会报错

```
// 报错
const foo = 'bar';
const bar = 'abc';
const baz = { [foo] };

// 正确
const foo = 'bar';
const baz = { [foo]: 'abc'};
```

注意，属性名表达式如果是一个对象，默认情况下会自动将对象转为字符串`[object Object]`

```
const keyA = {a: 1};
const keyB = {b: 2};

const myObject = {
  [keyA]: 'valueA',
  [keyB]: 'valueB'
};

myObject // Object {[object Object]: "valueB"}
```

### 三、super关键字

`this`关键字总是指向函数所在的当前对象，ES6 又新增了另一个类似的关键字`super`，指向当前对象的原型对象

```
const proto = {
  foo: 'hello'
};

const obj = {
  foo: 'world',
  find() {
    return super.foo;
  }
};

Object.setPrototypeOf(obj, proto); // 为obj设置原型对象
obj.find() // "hello"
```

### 四、扩展运算符的应用

在解构赋值中，未被读取的可遍历的属性，分配到指定的对象上面

```
let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
x // 1
y // 2
z // { a: 3, b: 4 }
```

注意：解构赋值必须是最后一个参数，否则会报错

解构赋值是浅拷贝

```
let obj = { a: { b: 1 } };
let { ...x } = obj;
obj.a.b = 2; // 修改obj里面a属性中键值
x.a.b // 2，影响到了结构出来x的值
```

对象的扩展运算符等同于使用`Object.assign()`方法

### 五、属性的遍历

ES6 一共有 5 种方法可以遍历对象的属性。

- for...in：循环遍历对象自身的和继承的可枚举属性（不含 Symbol 属性）
- Object.keys(obj)：返回一个数组，包括对象自身的（不含继承的）所有可枚举属性（不含 Symbol 属性）的键名
- Object.getOwnPropertyNames(obj)：回一个数组，包含对象自身的所有属性（不含 Symbol 属性，但是包括不可枚举属性）的键名
- Object.getOwnPropertySymbols(obj)：返回一个数组，包含对象自身的所有 Symbol 属性的键名
- Reflect.ownKeys(obj)：返回一个数组，包含对象自身的（不含继承的）所有键名，不管键名是 Symbol 或字符串，也不管是否可枚举

上述遍历，都遵守同样的属性遍历的次序规则：

- 首先遍历所有数值键，按照数值升序排列
- 其次遍历所有字符串键，按照加入时间升序排列
- 最后遍历所有 Symbol 键，按照加入时间升序排

```
Reflect.ownKeys({ [Symbol()]:0, b:0, 10:0, 2:0, a:0 })
// ['2', '10', 'b', 'a', Symbol()]
```

### 六、对象新增的方法

关于对象新增的方法，分别有以下：

- Object.is()
- Object.assign()
- Object.getOwnPropertyDescriptors()
- Object.setPrototypeOf()，Object.getPrototypeOf()
- Object.keys()，Object.values()，Object.entries()
- Object.fromEntries()

#### Object.is()

严格判断两个值是否相等，与严格比较运算符（===）的行为基本一致，不同之处只有两个：一是`+0`不等于`-0`，二是`NaN`等于自身

```
+0 === -0 //true
NaN === NaN // false

Object.is(+0, -0) // false
Object.is(NaN, NaN) // true
```

#### Object.assign()

```
Object.assign()`方法用于对象的合并，将源对象`source`的所有可枚举属性，复制到目标对象`target
```

`Object.assign()`方法的第一个参数是目标对象，后面的参数都是源对象

```
const target = { a: 1, b: 1 };

const source1 = { b: 2, c: 2 };
const source2 = { c: 3 };

Object.assign(target, source1, source2);
target // {a:1, b:2, c:3}
```

注意：`Object.assign()`方法是浅拷贝，遇到同名属性会进行替换

#### Object.getOwnPropertyDescriptors()

返回指定对象所有自身属性（非继承属性）的描述对象

```
const obj = {
  foo: 123,
  get bar() { return 'abc' }
};

Object.getOwnPropertyDescriptors(obj)
// { foo:
//    { value: 123,
//      writable: true,
//      enumerable: true,
//      configurable: true },
//   bar:
//    { get: [Function: get bar],
//      set: undefined,
//      enumerable: true,
//      configurable: true } }
```

#### Object.setPrototypeOf()

`Object.setPrototypeOf`方法用来设置一个对象的原型对象

```
Object.setPrototypeOf(object, prototype)

// 用法
const o = Object.setPrototypeOf({}, null);
```

#### Object.getPrototypeOf()

用于读取一个对象的原型对象

```
Object.getPrototypeOf(obj);
```

#### Object.keys()

返回自身的（不含继承的）所有可遍历（enumerable）属性的键名的数组

```
var obj = { foo: 'bar', baz: 42 };
Object.keys(obj)
// ["foo", "baz"]
```

#### Object.values()

返回自身的（不含继承的）所有可遍历（enumerable）属性的键对应值的数组

```
const obj = { foo: 'bar', baz: 42 };
Object.values(obj)
// ["bar", 42]
```

#### Object.entries()

返回一个对象自身的（不含继承的）所有可遍历（enumerable）属性的键值对的数组

```
const obj = { foo: 'bar', baz: 42 };
Object.entries(obj)
// [ ["foo", "bar"], ["baz", 42] ]
```

#### Object.fromEntries()

用于将一个键值对数组转为对象

```
Object.fromEntries([
  ['foo', 'bar'],
  ['baz', 42]
])
// { foo: "bar", baz: 42 }
```

### 参考文献

- https://es6.ruanyifeng.com/#docs/object

## 4、ES6中函数新增了哪些扩展?【函数扩展】

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTaOmibbrA3BLJVTDa7Ae8zmBH6Ml2XbciabiaZgwrBVh5GP1cwl6YoeA04GwIMu857qKiavib9Tqcr47Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、参数

`ES6`允许为函数的参数设置默认值

```
function log(x, y = 'World') {
  console.log(x, y);
}

console.log('Hello') // Hello World
console.log('Hello', 'China') // Hello China
console.log('Hello', '') // Hello
```

函数的形参是默认声明的，不能使用`let`或`const`再次声明

```
function foo(x = 5) {
    let x = 1; // error
    const x = 2; // error
}
```

参数默认值可以与解构赋值的默认值结合起来使用

```
function foo({x, y = 5}) {
  console.log(x, y);
}

foo({}) // undefined 5
foo({x: 1}) // 1 5
foo({x: 1, y: 2}) // 1 2
foo() // TypeError: Cannot read property 'x' of undefined
```

上面的`foo`函数，当参数为对象的时候才能进行解构，如果没有提供参数的时候，变量`x`和`y`就不会生成，从而报错，这里设置默认值避免

```
function foo({x, y = 5} = {}) {
  console.log(x, y);
}

foo() // undefined 5
```

参数默认值应该是函数的尾参数，如果不是非尾部的参数设置默认值，实际上这个参数是没发省略的

```
function f(x = 1, y) {
  return [x, y];
}

f() // [1, undefined]
f(2) // [2, undefined]
f(, 1) // 报错
f(undefined, 1) // [1, 1]
```

### 二、属性

#### 函数的length属性

`length`将返回没有指定默认值的参数个数

```
(function (a) {}).length // 1
(function (a = 5) {}).length // 0
(function (a, b, c = 5) {}).length // 2
```

`rest` 参数也不会计入`length`属性

```
(function(...args) {}).length // 0
```

如果设置了默认值的参数不是尾参数，那么`length`属性也不再计入后面的参数了

```
(function (a = 0, b, c) {}).length // 0
(function (a, b = 1, c) {}).length // 1
```

#### name属性

返回该函数的函数名

```
var f = function () {};

// ES5
f.name // ""

// ES6
f.name // "f"
```

如果将一个具名函数赋值给一个变量，则 `name`属性都返回这个具名函数原本的名字

```
const bar = function baz() {};
bar.name // "baz"
Function`构造函数返回的函数实例，`name`属性的值为`anonymous
(new Function).name // "anonymous"
```

`bind`返回的函数，`name`属性值会加上`bound`前缀

```
function foo() {};
foo.bind({}).name // "bound foo"

(function(){}).bind({}).name // "bound "
```

### 三、作用域

一旦设置了参数的默认值，函数进行声明初始化时，参数会形成一个单独的作用域

等到初始化结束，这个作用域就会消失。这种语法行为，在不设置参数默认值时，是不会出现的

下面例子中，`y=x`会形成一个单独作用域，`x`没有被定义，所以指向全局变量`x`

```
let x = 1;

function f(y = x) { 
  // 等同于 let y = x  
  let x = 2; 
  console.log(y);
}

f() // 1
```

### 四、严格模式

只要函数参数使用了默认值、解构赋值、或者扩展运算符，那么函数内部就不能显式设定为严格模式，否则会报错

```
// 报错
function doSomething(a, b = a) {
  'use strict';
  // code
}

// 报错
const doSomething = function ({a, b}) {
  'use strict';
  // code
};

// 报错
const doSomething = (...a) => {
  'use strict';
  // code
};

const obj = {
  // 报错
  doSomething({a, b}) {
    'use strict';
    // code
  }
};
```

### 五、箭头函数

使用“箭头”（`=>`）定义函数

```
var f = v => v;

// 等同于
var f = function (v) {
  return v;
};
```

如果箭头函数不需要参数或需要多个参数，就使用一个圆括号代表参数部分

```
var f = () => 5;
// 等同于
var f = function () { return 5 };

var sum = (num1, num2) => num1 + num2;
// 等同于
var sum = function(num1, num2) {
  return num1 + num2;
};
```

如果箭头函数的代码块部分多于一条语句，就要使用大括号将它们括起来，并且使用`return`语句返回

```
var sum = (num1, num2) => { return num1 + num2; }
```

如果返回对象，需要加括号将对象包裹

```
let getTempItem = id => ({ id: id, name: "Temp" });
```

注意点：

- 函数体内的`this`对象，就是定义时所在的对象，而不是使用时所在的对象
- 不可以当作构造函数，也就是说，不可以使用`new`命令，否则会抛出一个错误
- 不可以使用`arguments`对象，该对象在函数体内不存在。如果要用，可以用 `rest` 参数代替
- 不可以使用`yield`命令，因此箭头函数不能用作 Generator 函数

### 参考文献

- https://es6.ruanyifeng.com/#docs/function

## 5、ES6中新增的Set、Map两种数据结构怎么理解?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRicw6vlUlGfIkVQ8X6SKD27VyKIzKFEibciaQTCFSOrU6oicyRImp2ic3MdLKCxZicRbHaTHUibf0Uep9TA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

如果要用一句话来描述，我们可以说

`Set`是一种叫做集合的数据结构，`Map`是一种叫做字典的数据结构

什么是集合？什么又是字典？

- 集合
  是由一堆无序的、相关联的，且不重复的内存结构【数学中称为元素】组成的组合
- 字典
  是一些元素的集合。每个元素有一个称作key 的域，不同元素的key 各不相同

区别？

- 共同点：集合、字典都可以存储不重复的值
- 不同点：集合是以[值，值]的形式存储元素，字典是以[键，值]的形式存储

### 一、Set

`Set`是`es6`新增的数据结构，类似于数组，但是成员的值都是唯一的，没有重复的值，我们一般称为集合

`Set`本身是一个构造函数，用来生成 Set 数据结构

```
const s = new Set();
```

#### 增删改查

`Set`的实例关于增删改查的方法：

- add()
- delete()
- has()
- clear()

#### add()

添加某个值，返回 `Set` 结构本身

当添加实例中已经存在的元素，`set`不会进行处理添加

```
s.add(1).add(2).add(2); // 2只被添加了一次
```

#### delete()

删除某个值，返回一个布尔值，表示删除是否成功

```
s.delete(1)
```

#### has()

返回一个布尔值，判断该值是否为`Set`的成员

```
s.has(2)
```

#### clear()

清除所有成员，没有返回值

```
s.clear()
```

#### 遍历

`Set`实例遍历的方法有如下：

关于遍历的方法，有如下：

- keys()：返回键名的遍历器
- values()：返回键值的遍历器
- entries()：返回键值对的遍历器
- forEach()：使用回调函数遍历每个成员

`Set`的遍历顺序就是插入顺序

`keys`方法、`values`方法、`entries`方法返回的都是遍历器对象

```
let set = new Set(['red', 'green', 'blue']);

for (let item of set.keys()) {
  console.log(item);
}
// red
// green
// blue

for (let item of set.values()) {
  console.log(item);
}
// red
// green
// blue

for (let item of set.entries()) {
  console.log(item);
}
// ["red", "red"]
// ["green", "green"]
// ["blue", "blue"]
forEach()`用于对每个成员执行某种操作，没有返回值，键值、键名都相等，同样的`forEach`方法有第二个参数，用于绑定处理函数的`this
let set = new Set([1, 4, 9]);
set.forEach((value, key) => console.log(key + ' : ' + value))
// 1 : 1
// 4 : 4
// 9 : 9
```

扩展运算符和`Set` 结构相结合实现数组或字符串去重

```
// 数组
let arr = [3, 5, 2, 2, 5, 5];
let unique = [...new Set(arr)]; // [3, 5, 2]

// 字符串
let str = "352255";
let unique = [...new Set(str)].join(""); // ""
```

实现并集、交集、和差集

```
let a = new Set([1, 2, 3]);
let b = new Set([4, 3, 2]);

// 并集
let union = new Set([...a, ...b]);
// Set {1, 2, 3, 4}

// 交集
let intersect = new Set([...a].filter(x => b.has(x)));
// set {2, 3}

// （a 相对于 b 的）差集
let difference = new Set([...a].filter(x => !b.has(x)));
// Set {1}
```

### 二、Map

`Map`类型是键值对的有序列表，而键和值都可以是任意类型

`Map`本身是一个构造函数，用来生成 `Map` 数据结构

```
const m = new Map()
```

#### 增删改查

`Map` 结构的实例针对增删改查有以下属性和操作方法：

- size 属性
- set()
- get()
- has()
- delete()
- clear()

#### size

`size`属性返回 Map 结构的成员总数。

```
const map = new Map();
map.set('foo', true);
map.set('bar', false);

map.size // 2
```

#### set()

设置键名`key`对应的键值为`value`，然后返回整个 Map 结构

如果`key`已经有值，则键值会被更新，否则就新生成该键

同时返回的是当前`Map`对象，可采用链式写法

```
const m = new Map();

m.set('edition', 6)        // 键是字符串
m.set(262, 'standard')     // 键是数值
m.set(undefined, 'nah')    // 键是 undefined
m.set(1, 'a').set(2, 'b').set(3, 'c') // 链式操作
```

#### get()

```
get`方法读取`key`对应的键值，如果找不到`key`，返回`undefined
const m = new Map();

const hello = function() {console.log('hello');};
m.set(hello, 'Hello ES6!') // 键是函数

m.get(hello)  // Hello ES6!
```

#### has()

`has`方法返回一个布尔值，表示某个键是否在当前 Map 对象之中

```
const m = new Map();

m.set('edition', 6);
m.set(262, 'standard');
m.set(undefined, 'nah');

m.has('edition')     // true
m.has('years')       // false
m.has(262)           // true
m.has(undefined)     // true
```

#### delete()

```
delete`方法删除某个键，返回`true`。如果删除失败，返回`false
const m = new Map();
m.set(undefined, 'nah');
m.has(undefined)     // true

m.delete(undefined)
m.has(undefined)       // false
```

#### clear()

`clear`方法清除所有成员，没有返回值

```
let map = new Map();
map.set('foo', true);
map.set('bar', false);

map.size // 2
map.clear()
map.size // 0
```

#### 遍历

`Map`结构原生提供三个遍历器生成函数和一个遍历方法：

- keys()：返回键名的遍历器
- values()：返回键值的遍历器
- entries()：返回所有成员的遍历器
- forEach()：遍历 Map 的所有成员

遍历顺序就是插入顺序

```
const map = new Map([
  ['F', 'no'],
  ['T',  'yes'],
]);

for (let key of map.keys()) {
  console.log(key);
}
// "F"
// "T"

for (let value of map.values()) {
  console.log(value);
}
// "no"
// "yes"

for (let item of map.entries()) {
  console.log(item[0], item[1]);
}
// "F" "no"
// "T" "yes"

// 或者
for (let [key, value] of map.entries()) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"

// 等同于使用map.entries()
for (let [key, value] of map) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"

map.forEach(function(value, key, map) {
  console.log("Key: %s, Value: %s", key, value);
});
```

### 三、WeakSet 和 WeakMap

#### WeakSet

创建`WeakSet`实例

```
const ws = new WeakSet();
```

`WeakSet`可以接受一个具有 `Iterable`接口的对象作为参数

```
const a = [[1, 2], [3, 4]];
const ws = new WeakSet(a);
// WeakSet {[1, 2], [3, 4]}
```

在`API`中`WeakSet`与`Set`有两个区别：

- 没有遍历操作的`API`
- 没有`size`属性

`WeackSet`只能成员只能是引用类型，而不能是其他类型的值

```
let ws=new WeakSet();

// 成员不是引用类型
let weakSet=new WeakSet([2,3]);
console.log(weakSet) // 报错

// 成员为引用类型
let obj1={name:1}
let obj2={name:1}
let ws=new WeakSet([obj1,obj2]); 
console.log(ws) //WeakSet {{…}, {…}}
```

`WeakSet`里面的引用只要在外部消失，它在 `WeakSet`里面的引用就会自动消失

#### WeakMap

`WeakMap`结构与`Map`结构类似，也是用于生成键值对的集合

在`API`中`WeakMap`与`Map`有两个区别：

- 没有遍历操作的`API`
- 没有`clear`清空方法

```
// WeakMap 可以使用 set 方法添加成员
const wm1 = new WeakMap();
const key = {foo: 1};
wm1.set(key, 2);
wm1.get(key) // 2

// WeakMap 也可以接受一个数组，
// 作为构造函数的参数
const k1 = [1, 2, 3];
const k2 = [4, 5, 6];
const wm2 = new WeakMap([[k1, 'foo'], [k2, 'bar']]);
wm2.get(k2) // "bar"
```

`WeakMap`只接受对象作为键名（`null`除外），不接受其他类型的值作为键名

```
const map = new WeakMap();
map.set(1, 2)
// TypeError: 1 is not an object!
map.set(Symbol(), 2)
// TypeError: Invalid value used as weak map key
map.set(null, 2)
// TypeError: Invalid value used as weak map key
```

`WeakMap`的键名所指向的对象，一旦不再需要，里面的键名对象和所对应的键值对会自动消失，不用手动删除引用

举个场景例子：

在网页的 DOM 元素上添加数据，就可以使用`WeakMap`结构，当该 DOM 元素被清除，其所对应的`WeakMap`记录就会自动被移除

```
const wm = new WeakMap();

const element = document.getElementById('example');

wm.set(element, 'some information');
wm.get(element) // "some information"
```

注意：`WeakMap` 弱引用的只是键名，而不是键值。键值依然是正常引用

下面代码中，键值`obj`会在`WeakMap`产生新的引用，当你修改`obj`不会影响到内部

```
const wm = new WeakMap();
let key = {};
let obj = {foo: 1};

wm.set(key, obj);
obj = null;
wm.get(key)
// Object {foo: 1}
```

### 参考文献

- https://es6.ruanyifeng.com/#docs/set-map

## 6、你是怎么理解ES6中 Promise的？使用场景？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQKibvoLx6ssfSibFQ9hWVZ6SiaCQEVJFnoicJqWZ5oia3qGBib581autsmvCRnE3mVmlZjGJibBzmsjWVicw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、介绍

`Promise`，译为承诺，是异步编程的一种解决方案，比传统的解决方案（回调函数）更加合理和更加强大

在以往我们如果处理多层异步操作，我们往往会像下面那样编写我们的代码

```
doSomething(function(result) {
  doSomethingElse(result, function(newResult) {
    doThirdThing(newResult, function(finalResult) {
      console.log('得到最终结果: ' + finalResult);
    }, failureCallback);
  }, failureCallback);
}, failureCallback);
```

阅读上面代码，是不是很难受，上述形成了经典的回调地狱

现在通过`Promise`的改写上面的代码

```
doSomething().then(function(result) {
  return doSomethingElse(result);
})
.then(function(newResult) {
  return doThirdThing(newResult);
})
.then(function(finalResult) {
  console.log('得到最终结果: ' + finalResult);
})
.catch(failureCallback);
```

瞬间感受到`promise`解决异步操作的优点：

- 链式操作减低了编码难度
- 代码可读性明显增强

下面我们正式来认识`promise`：

#### 状态

`promise`对象仅有三种状态

- `pending`（进行中）
- `fulfilled`（已成功）
- `rejected`（已失败）

#### 特点

- 对象的状态不受外界影响，只有异步操作的结果，可以决定当前是哪一种状态
- 一旦状态改变（从`pending`变为`fulfilled`和从`pending`变为`rejected`），就不会再变，任何时候都可以得到这个结果

#### 流程

认真阅读下图，我们能够轻松了解`promise`整个流程

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQKibvoLx6ssfSibFQ9hWVZ6S1rwOjj6JtJJPhGQ63iaYbGzSbibO6bYH6WcQe21cX4PwVvibiaHboTTvdw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 二、用法

`Promise`对象是一个构造函数，用来生成`Promise`实例

```
const promise = new Promise(function(resolve, reject) {});
Promise`构造函数接受一个函数作为参数，该函数的两个参数分别是`resolve`和`reject
```

- `resolve`函数的作用是，将`Promise`对象的状态从“未完成”变为“成功”
- `reject`函数的作用是，将`Promise`对象的状态从“未完成”变为“失败”

#### 实例方法

`Promise`构建出来的实例存在以下方法：

- then()
- then()
- catch()
- finally()

##### then()

`then`是实例状态发生改变时的回调函数，第一个参数是`resolved`状态的回调函数，第二个参数是`rejected`状态的回调函数

`then`方法返回的是一个新的`Promise`实例，也就是`promise`能链式书写的原因

```
getJSON("/posts.json").then(function(json) {
  return json.post;
}).then(function(post) {
  // ...
});
```

##### catch

`catch()`方法是`.then(null, rejection)`或`.then(undefined, rejection)`的别名，用于指定发生错误时的回调函数

```
getJSON('/posts.json').then(function(posts) {
  // ...
}).catch(function(error) {
  // 处理 getJSON 和 前一个回调函数运行时发生的错误
  console.log('发生错误！', error);
});
```

`Promise`对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止

```
getJSON('/post/1.json').then(function(post) {
  return getJSON(post.commentURL);
}).then(function(comments) {
  // some code
}).catch(function(error) {
  // 处理前面三个Promise产生的错误
});
```

一般来说，使用`catch`方法代替`then()`第二个参数

`Promise`对象抛出的错误不会传递到外层代码，即不会有任何反应

```
const someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    // 下面一行会报错，因为x没有声明
    resolve(x + 2);
  });
};
```

浏览器运行到这一行，会打印出错误提示`ReferenceError: x is not defined`，但是不会退出进程

`catch()`方法之中，还能再抛出错误，通过后面`catch`方法捕获到

##### finally()

`finally()`方法用于指定不管 Promise 对象最后状态如何，都会执行的操作

```
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
```

#### 构造函数方法

`Promise`构造函数存在以下方法：

- all()
- race()
- allSettled()
- resolve()
- reject()
- try()

##### all()

`Promise.all()`方法用于将多个 `Promise`实例，包装成一个新的 `Promise`实例

```
const p = Promise.all([p1, p2, p3]);
```

接受一个数组（迭代对象）作为参数，数组成员都应为`Promise`实例

实例`p`的状态由`p1`、`p2`、`p3`决定，分为两种：

- 只有`p1`、`p2`、`p3`的状态都变成`fulfilled`，`p`的状态才会变成`fulfilled`，此时`p1`、`p2`、`p3`的返回值组成一个数组，传递给`p`的回调函数
- 只要`p1`、`p2`、`p3`之中有一个被`rejected`，`p`的状态就变成`rejected`，此时第一个被`reject`的实例的返回值，会传递给`p`的回调函数

注意，如果作为参数的 `Promise` 实例，自己定义了`catch`方法，那么它一旦被`rejected`，并不会触发`Promise.all()`的`catch`方法

```
const p1 = new Promise((resolve, reject) => {
  resolve('hello');
})
.then(result => result)
.catch(e => e);

const p2 = new Promise((resolve, reject) => {
  throw new Error('报错了');
})
.then(result => result)
.catch(e => e);

Promise.all([p1, p2])
.then(result => console.log(result))
.catch(e => console.log(e));
// ["hello", Error: 报错了]
```

如果`p2`没有自己的`catch`方法，就会调用`Promise.all()`的`catch`方法

```
const p1 = new Promise((resolve, reject) => {
  resolve('hello');
})
.then(result => result);

const p2 = new Promise((resolve, reject) => {
  throw new Error('报错了');
})
.then(result => result);

Promise.all([p1, p2])
.then(result => console.log(result))
.catch(e => console.log(e));
// Error: 报错了
```

##### race()

`Promise.race()`方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例

```
const p = Promise.race([p1, p2, p3]);
```

只要`p1`、`p2`、`p3`之中有一个实例率先改变状态，`p`的状态就跟着改变

率先改变的 Promise 实例的返回值则传递给`p`的回调函数

```
const p = Promise.race([
  fetch('/resource-that-may-take-a-while'),
  new Promise(function (resolve, reject) {
    setTimeout(() => reject(new Error('request timeout')), 5000)
  })
]);

p
.then(console.log)
.catch(console.error);
```

##### allSettled()

`Promise.allSettled()`方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例

只有等到所有这些参数实例都返回结果，不管是`fulfilled`还是`rejected`，包装实例才会结束

```
const promises = [
  fetch('/api-1'),
  fetch('/api-2'),
  fetch('/api-3'),
];

await Promise.allSettled(promises);
removeLoadingIndicator();
```

##### resolve()

将现有对象转为 `Promise`对象

```
Promise.resolve('foo')
// 等价于
new Promise(resolve => resolve('foo'))
```

参数可以分成四种情况，分别如下：

- 参数是一个 Promise 实例，`promise.resolve`将不做任何修改、原封不动地返回这个实例
- 参数是一个`thenable`对象，`promise.resolve`会将这个对象转为 `Promise`对象，然后就立即执行`thenable`对象的`then()`方法
- 参数不是具有`then()`方法的对象，或根本就不是对象，`Promise.resolve()`会返回一个新的 Promise 对象，状态为`resolved`
- 没有参数时，直接返回一个`resolved`状态的 Promise 对象

##### reject()

```
Promise.reject(reason)`方法也会返回一个新的 Promise 实例，该实例的状态为`rejected
const p = Promise.reject('出错了');
// 等同于
const p = new Promise((resolve, reject) => reject('出错了'))

p.then(null, function (s) {
  console.log(s)
});
// 出错了
```

`Promise.reject()`方法的参数，会原封不动地变成后续方法的参数

```
Promise.reject('出错了')
.catch(e => {
  console.log(e === '出错了')
})
// true
```

### 三、使用场景

将图片的加载写成一个`Promise`，一旦加载完成，`Promise`的状态就发生变化

```
const preloadImage = function (path) {
  return new Promise(function (resolve, reject) {
    const image = new Image();
    image.onload  = resolve;
    image.onerror = reject;
    image.src = path;
  });
};
```

通过链式操作，将多个渲染数据分别给个`then`，让其各司其职。或当下个异步请求依赖上个请求结果的时候，我们也能够通过链式操作友好解决问题

```
// 各司其职
getInfo().then(res=>{
    let { bannerList } = res
    //渲染轮播图
    console.log(bannerList)
    return res
}).then(res=>{
    
    let { storeList } = res
    //渲染店铺列表
    console.log(storeList)
    return res
}).then(res=>{
    let { categoryList } = res
    console.log(categoryList)
    //渲染分类列表
    return res
})
```

通过`all()`实现多个请求合并在一起，汇总所有请求结果，只需设置一个`loading`即可

```
function initLoad(){
    // loading.show() //加载loading
    Promise.all([getBannerList(),getStoreList(),getCategoryList()]).then(res=>{
        console.log(res)
        loading.hide() //关闭loading
    }).catch(err=>{
        console.log(err)
        loading.hide()//关闭loading
    })
}
//数据初始化    
initLoad()
```

通过`race`可以设置图片请求超时

```
//请求某个图片资源
function requestImg(){
    var p = new Promise(function(resolve, reject){
        var img = new Image();
        img.onload = function(){
           resolve(img);
        }
        //img.src = "https://b-gold-cdn.xitu.io/v3/static/img/logo.a7995ad.svg"; 正确的
        img.src = "https://b-gold-cdn.xitu.io/v3/static/img/logo.a7995ad.svg1";
    });
    return p;
}

//延时函数，用于给请求计时
function timeout(){
    var p = new Promise(function(resolve, reject){
        setTimeout(function(){
            reject('图片请求超时');
        }, 5000);
    });
    return p;
}

Promise
.race([requestImg(), timeout()])
.then(function(results){
    console.log(results);
})
.catch(function(reason){
    console.log(reason);
});
```

### 参考文献

- https://es6.ruanyifeng.com/#docs/promise

## 7、怎么理解ES6中 Generator的？使用场景？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRJ6UMCVMicj7FLr8icic0wdGz9a85CMu6GPrj3aOlkibgkgRus6BwTYQxCccaI88ZLfXGrAsZEvcsJcw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、介绍

Generator 函数是 ES6 提供的一种异步编程解决方案，语法行为与传统函数完全不同

回顾下上文提到的解决异步的手段：

- 回调函数
- promise

那么，上文我们提到`promsie`已经是一种比较流行的解决异步方案，那么为什么还出现`Generator`？甚至`async/await`呢？

该问题我们留在后面再进行分析，下面先认识下`Generator`

#### Generator函数

执行 `Generator` 函数会返回一个遍历器对象，可以依次遍历 `Generator` 函数内部的每一个状态

形式上，`Generator`函数是一个普通函数，但是有两个特征：

- `function`关键字与函数名之间有一个星号
- 函数体内部使用`yield`表达式，定义不同的内部状态

```
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}
```

### 二、使用

`Generator` 函数会返回一个遍历器对象，即具有`Symbol.iterator`属性，并且返回给自己

```
function* gen(){
  // some code
}

var g = gen();

g[Symbol.iterator]() === g
// true
```

通过`yield`关键字可以暂停`generator`函数返回的遍历器对象的状态

```
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}
var hw = helloWorldGenerator();
```

上述存在三个状态：`hello`、`world`、`return`

通过`next`方法才会遍历到下一个内部状态，其运行逻辑如下：

- 遇到`yield`表达式，就暂停执行后面的操作，并将紧跟在`yield`后面的那个表达式的值，作为返回的对象的`value`属性值。
- 下一次调用`next`方法时，再继续往下执行，直到遇到下一个`yield`表达式
- 如果没有再遇到新的`yield`表达式，就一直运行到函数结束，直到`return`语句为止，并将`return`语句后面的表达式的值，作为返回的对象的`value`属性值。
- 如果该函数没有`return`语句，则返回的对象的`value`属性值为`undefined`

```
hw.next()
// { value: 'hello', done: false }

hw.next()
// { value: 'world', done: false }

hw.next()
// { value: 'ending', done: true }

hw.next()
// { value: undefined, done: true }
```

`done`用来判断是否存在下个状态，`value`对应状态值

```
yield`表达式本身没有返回值，或者说总是返回`undefined
```

通过调用`next`方法可以带一个参数，该参数就会被当作上一个`yield`表达式的返回值

```
function* foo(x) {
  var y = 2 * (yield (x + 1));
  var z = yield (y / 3);
  return (x + y + z);
}

var a = foo(5);
a.next() // Object{value:6, done:false}
a.next() // Object{value:NaN, done:false}
a.next() // Object{value:NaN, done:true}

var b = foo(5);
b.next() // { value:6, done:false }
b.next(12) // { value:8, done:false }
b.next(13) // { value:42, done:true }
```

正因为`Generator`函数返回`Iterator`对象，因此我们还可以通过`for...of`进行遍历

```
function* foo() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
  return 6;
}

for (let v of foo()) {
  console.log(v);
}
// 1 2 3 4 5
```

原生对象没有遍历接口，通过`Generator`函数为它加上这个接口，就能使用`for...of`进行遍历了

```
function* objectEntries(obj) {
  let propKeys = Reflect.ownKeys(obj);

  for (let propKey of propKeys) {
    yield [propKey, obj[propKey]];
  }
}

let jane = { first: 'Jane', last: 'Doe' };

for (let [key, value] of objectEntries(jane)) {
  console.log(`${key}: ${value}`);
}
// first: Jane
// last: Doe
```

### 三、异步解决方案

回顾之前展开异步解决的方案：

- 回调函数
- Promise 对象
- generator 函数
- async/await

这里通过文件读取案例，将几种解决异步的方案进行一个比较：

#### 回调函数

所谓回调函数，就是把任务的第二段单独写在一个函数里面，等到重新执行这个任务的时候，再调用这个函数

```
fs.readFile('/etc/fstab', function (err, data) {
  if (err) throw err;
  console.log(data);
  fs.readFile('/etc/shells', function (err, data) {
    if (err) throw err;
    console.log(data);
  });
});
```

`readFile`函数的第三个参数，就是回调函数，等到操作系统返回了`/etc/passwd`这个文件以后，回调函数才会执行

#### Promise

`Promise`就是为了解决回调地狱而产生的，将回调函数的嵌套，改成链式调用

```
const fs = require('fs');

const readFile = function (fileName) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fileName, function(error, data) {
      if (error) return reject(error);
      resolve(data);
    });
  });
};


readFile('/etc/fstab').then(data =>{
    console.log(data)
    return readFile('/etc/shells')
}).then(data => {
    console.log(data)
})
```

这种链式操作形式，使异步任务的两段执行更清楚了，但是也存在了很明显的问题，代码变得冗杂了，语义化并不强

#### generator

`yield`表达式可以暂停函数执行，`next`方法用于恢复函数执行，这使得`Generator`函数非常适合将异步任务同步化

```
const gen = function* () {
  const f1 = yield readFile('/etc/fstab');
  const f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

#### async/await

将上面`Generator`函数改成`async/await`形式，更为简洁，语义化更强了

```
const asyncReadFile = async function () {
  const f1 = await readFile('/etc/fstab');
  const f2 = await readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

#### 区别：

通过上述代码进行分析，将`promise`、`Generator`、`async/await`进行比较：

- `promise`和`async/await`是专门用于处理异步操作的
- `Generator`并不是为异步而设计出来的，它还有其他功能（对象迭代、控制输出、部署`Interator`接口...）
- `promise`编写代码相比`Generator`、`async`更为复杂化，且可读性也稍差
- `Generator`、`async`需要与`promise`对象搭配处理异步情况
- `async`实质是`Generator`的语法糖，相当于会自动执行`Generator`函数
- `async`使用上更为简洁，将异步代码以同步的形式进行编写，是处理异步编程的最终方案

### 四、使用场景

`Generator`是异步解决的一种方案，最大特点则是将异步操作同步化表达出来

```
function* loadUI() {
  showLoadingScreen();
  yield loadUIDataAsynchronously();
  hideLoadingScreen();
}
var loader = loadUI();
// 加载UI
loader.next()

// 卸载UI
loader.next()
```

包括`redux-saga`中间件也充分利用了`Generator`特性

```
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import Api from '...'

function* fetchUser(action) {
   try {
      const user = yield call(Api.fetchUser, action.payload.userId);
      yield put({type: "USER_FETCH_SUCCEEDED", user: user});
   } catch (e) {
      yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}

function* mySaga() {
  yield takeEvery("USER_FETCH_REQUESTED", fetchUser);
}

function* mySaga() {
  yield takeLatest("USER_FETCH_REQUESTED", fetchUser);
}

export default mySaga;
```

还能利用`Generator`函数，在对象上实现`Iterator`接口

```
function* iterEntries(obj) {
  let keys = Object.keys(obj);
  for (let i=0; i < keys.length; i++) {
    let key = keys[i];
    yield [key, obj[key]];
  }
}

let myObj = { foo: 3, bar: 7 };

for (let [key, value] of iterEntries(myObj)) {
  console.log(key, value);
}

// foo 3
// bar 7
```

### 参考文献

- https://es6.ruanyifeng.com/#docs/generator-async

## 8、你是怎么理解ES6中Proxy的？使用场景?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTE1ebCE2ZN1KIG9Tzwt7yuI41RyAWwC94keBibUTrpLJWQoicibqAyNIKoa8ALWXMLk33mwWrvBWDwA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、介绍

**定义：** 用于定义基本操作的自定义行为

**本质：** 修改的是程序默认形为，就形同于在编程语言层面上做修改，属于元编程`(meta programming)`

元编程（Metaprogramming，又译超编程，是指某类计算机程序的编写，这类计算机程序编写或者操纵其它程序（或者自身）作为它们的数据，或者在运行时完成部分本应在编译时完成的工作

一段代码来理解

```
#!/bin/bash
# metaprogram
echo '#!/bin/bash' >program
for ((I=1; I<=1024; I++)) do
    echo "echo $I" >>program
done
chmod +x program
```

这段程序每执行一次能帮我们生成一个名为`program`的文件，文件内容为1024行`echo`，如果我们手动来写1024行代码，效率显然低效

- 元编程优点：与手工编写全部代码相比，程序员可以获得更高的工作效率，或者给与程序更大的灵活度去处理新的情形而无需重新编译

`Proxy` 亦是如此，用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）

### 二、用法

`Proxy`为 构造函数，用来生成 `Proxy`实例

```
var proxy = new Proxy(target, handler)
```

#### 参数

`target`表示所要拦截的目标对象（任何类型的对象，包括原生数组，函数，甚至另一个代理））

`handler`通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 `p` 的行为

#### handler解析

关于`handler`拦截属性，有如下：

- get(target,propKey,receiver)：拦截对象属性的读取
- set(target,propKey,value,receiver)：拦截对象属性的设置
- has(target,propKey)：拦截`propKey in proxy`的操作，返回一个布尔值
- deleteProperty(target,propKey)：拦截`delete proxy[propKey]`的操作，返回一个布尔值
- ownKeys(target)：拦截`Object.keys(proxy)`、`for...in`等循环，返回一个数组
- getOwnPropertyDescriptor(target, propKey)：拦截`Object.getOwnPropertyDescriptor(proxy, propKey)`，返回属性的描述对象
- defineProperty(target, propKey, propDesc)：拦截`Object.defineProperty(proxy, propKey, propDesc）`，返回一个布尔值
- preventExtensions(target)：拦截`Object.preventExtensions(proxy)`，返回一个布尔值
- getPrototypeOf(target)：拦截`Object.getPrototypeOf(proxy)`，返回一个对象
- isExtensible(target)：拦截`Object.isExtensible(proxy)`，返回一个布尔值
- setPrototypeOf(target, proto)：拦截`Object.setPrototypeOf(proxy, proto)`，返回一个布尔值
- apply(target, object, args)：拦截 Proxy 实例作为函数调用的操作
- construct(target, args)：拦截 Proxy 实例作为构造函数调用的操作

#### Reflect

若需要在`Proxy`内部调用对象的默认行为，建议使用`Reflect`，其是`ES6`中操作对象而提供的新 `API`

基本特点：

- 只要`Proxy`对象具有的代理方法，`Reflect`对象全部具有，以静态方法的形式存在
- 修改某些`Object`方法的返回结果，让其变得更合理（定义不存在属性行为的时候不报错而是返回`false`）
- 让`Object`操作都变成函数行为

下面我们介绍`proxy`几种用法：

#### get()

`get`接受三个参数，依次为目标对象、属性名和 `proxy` 实例本身，最后一个参数可选

```
var person = {
  name: "张三"
};

var proxy = new Proxy(person, {
  get: function(target, propKey) {
    return Reflect.get(target,propKey)
  }
});

proxy.name // "张三"
```

`get`能够对数组增删改查进行拦截，下面是试下你数组读取负数的索引

```
function createArray(...elements) {
  let handler = {
    get(target, propKey, receiver) {
      let index = Number(propKey);
      if (index < 0) {
        propKey = String(target.length + index);
      }
      return Reflect.get(target, propKey, receiver);
    }
  };

  let target = [];
  target.push(...elements);
  return new Proxy(target, handler);
}

let arr = createArray('a', 'b', 'c');
arr[-1] // c
```

注意：如果一个属性不可配置（configurable）且不可写（writable），则 Proxy 不能修改该属性，否则会报错

```
const target = Object.defineProperties({}, {
  foo: {
    value: 123,
    writable: false,
    configurable: false
  },
});

const handler = {
  get(target, propKey) {
    return 'abc';
  }
};

const proxy = new Proxy(target, handler);

proxy.foo
// TypeError: Invariant check failed
```

#### set()

`set`方法用来拦截某个属性的赋值操作，可以接受四个参数，依次为目标对象、属性名、属性值和 `Proxy` 实例本身

假定`Person`对象有一个`age`属性，该属性应该是一个不大于 200 的整数，那么可以使用`Proxy`保证`age`的属性值符合要求

```
let validator = {
  set: function(obj, prop, value) {
    if (prop === 'age') {
      if (!Number.isInteger(value)) {
        throw new TypeError('The age is not an integer');
      }
      if (value > 200) {
        throw new RangeError('The age seems invalid');
      }
    }

    // 对于满足条件的 age 属性以及其他属性，直接保存
    obj[prop] = value;
  }
};

let person = new Proxy({}, validator);

person.age = 100;

person.age // 100
person.age = 'young' // 报错
person.age = 300 // 报错
```

如果目标对象自身的某个属性，不可写且不可配置，那么`set`方法将不起作用

```
const obj = {};
Object.defineProperty(obj, 'foo', {
  value: 'bar',
  writable: false,
});

const handler = {
  set: function(obj, prop, value, receiver) {
    obj[prop] = 'baz';
  }
};

const proxy = new Proxy(obj, handler);
proxy.foo = 'baz';
proxy.foo // "bar"
```

注意，严格模式下，`set`代理如果没有返回`true`，就会报错

```
'use strict';
const handler = {
  set: function(obj, prop, value, receiver) {
    obj[prop] = receiver;
    // 无论有没有下面这一行，都会报错
    return false;
  }
};
const proxy = new Proxy({}, handler);
proxy.foo = 'bar';
// TypeError: 'set' on proxy: trap returned falsish for property 'foo'
```

#### deleteProperty()

`deleteProperty`方法用于拦截`delete`操作，如果这个方法抛出错误或者返回`false`，当前属性就无法被`delete`命令删除

```
var handler = {
  deleteProperty (target, key) {
    invariant(key, 'delete');
    Reflect.deleteProperty(target,key)
    return true;
  }
};
function invariant (key, action) {
  if (key[0] === '_') {
    throw new Error(`无法删除私有属性`);
  }
}

var target = { _prop: 'foo' };
var proxy = new Proxy(target, handler);
delete proxy._prop
// Error: 无法删除私有属性
```

注意，目标对象自身的不可配置（configurable）的属性，不能被`deleteProperty`方法删除，否则报错

#### 取消代理

```
Proxy.revocable(target, handler);
```

### 三、使用场景

`Proxy`其功能非常类似于设计模式中的代理模式，常用功能如下：

- 拦截和监视外部对对象的访问
- 降低函数或类的复杂度
- 在复杂操作前对操作进行校验或对所需资源进行管理

使用 `Proxy` 保障数据类型的准确性

```
let numericDataStore = { count: 0, amount: 1234, total: 14 };
numericDataStore = new Proxy(numericDataStore, {
    set(target, key, value, proxy) {
        if (typeof value !== 'number') {
            throw Error("属性只能是number类型");
        }
        return Reflect.set(target, key, value, proxy);
    }
});

numericDataStore.count = "foo"
// Error: 属性只能是number类型

numericDataStore.count = 333
// 赋值成功
```

声明了一个私有的 `apiKey`，便于 `api` 这个对象内部的方法调用，但不希望从外部也能够访问 `api._apiKey`

```
let api = {
    _apiKey: '123abc456def',
    getUsers: function(){ },
    getUser: function(userId){ },
    setUser: function(userId, config){ }
};
const RESTRICTED = ['_apiKey'];
api = new Proxy(api, {
    get(target, key, proxy) {
        if(RESTRICTED.indexOf(key) > -1) {
            throw Error(`${key} 不可访问.`);
        } return Reflect.get(target, key, proxy);
    },
    set(target, key, value, proxy) {
        if(RESTRICTED.indexOf(key) > -1) {
            throw Error(`${key} 不可修改`);
        } return Reflect.get(target, key, value, proxy);
    }
});

console.log(api._apiKey)
api._apiKey = '987654321'
// 上述都抛出错误
```

还能通过使用`Proxy`实现观察者模式

观察者模式（Observer mode）指的是函数自动观察数据对象，一旦对象有变化，函数就会自动执行

`observable`函数返回一个原始对象的 `Proxy` 代理，拦截赋值操作，触发充当观察者的各个函数

```
const queuedObservers = new Set();

const observe = fn => queuedObservers.add(fn);
const observable = obj => new Proxy(obj, {set});

function set(target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver);
  queuedObservers.forEach(observer => observer());
  return result;
}
```

观察者函数都放进`Set`集合，当修改`obj`的值，在会`set`函数中拦截，自动执行`Set`所有的观察者

### 参考文献

- https://es6.ruanyifeng.com/#docs/proxy
- https://vue3js.cn/es6

## 9、你是怎么理解ES6中Module的？使用场景？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibT82qYic8EmdpGxPhO8ibePyfVfib5Q3V00OCCh4DYwkIMZDOMS6icn4OcJx9lIicz6GMwgLlBNH9RdarA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、介绍

模块，（Module），是能够单独命名并独立地完成一定功能的程序语句的**集合（即程序代码和数据结构的集合体）**。

两个基本的特征：外部特征和内部特征

- 外部特征是指模块跟外部环境联系的接口（即其他模块或程序调用该模块的方式，包括有输入输出参数、引用的全局变量）和模块的功能
- 内部特征是指模块的内部环境具有的特点（即该模块的局部数据和程序代码）

#### 为什么需要模块化

- 代码抽象
- 代码封装
- 代码复用
- 依赖管理

如果没有模块化，我们代码会怎样？

- 变量和方法不容易维护，容易污染全局作用域
- 加载资源的方式通过script标签从上到下。
- 依赖的环境主观逻辑偏重，代码较多就会比较复杂。
- 大型项目资源难以维护，特别是多人合作的情况下，资源的引入会让人奔溃

因此，需要一种将`JavaScript`程序模块化的机制，如

- CommonJs (典型代表：node.js早期)
- AMD (典型代表：require.js)
- CMD (典型代表：sea.js)

#### AMD

`Asynchronous ModuleDefinition`（AMD），异步模块定义，采用异步方式加载模块。所有依赖模块的语句，都定义在一个回调函数中，等到模块加载完成之后，这个回调函数才会运行

代表库为`require.js`

```
/** main.js 入口文件/主模块 **/
// 首先用config()指定各模块路径和引用名
require.config({
  baseUrl: "js/lib",
  paths: {
    "jquery": "jquery.min",  //实际路径为js/lib/jquery.min.js
    "underscore": "underscore.min",
  }
});
// 执行基本操作
require(["jquery","underscore"],function($,_){
  // some code here
});
```

#### CommonJs

`CommonJS` 是一套 `Javascript` 模块规范，用于服务端

```
// a.js
module.exports={ foo , bar}

// b.js
const { foo,bar } = require('./a.js')
```

其有如下特点：

- 所有代码都运行在模块作用域，不会污染全局作用域
- 模块是同步加载的，即只有加载完成，才能执行后面的操作
- 模块在首次执行后就会缓存，再次加载只返回缓存结果，如果想要再次执行，可清除缓存
- `require`返回的值是被输出的值的拷贝，模块内部的变化也不会影响这个值

既然存在了`AMD`以及`CommonJs`机制，`ES6`的`Module`又有什么不一样？

ES6 在语言标准的层面上，实现了`Module`，即模块功能，完全可以取代 `CommonJS`和 `AMD`规范，成为浏览器和服务器通用的模块解决方案

`CommonJS` 和`AMD` 模块，都只能在运行时确定这些东西。比如，`CommonJS`模块就是对象，输入时必须查找对象属性

```
// CommonJS模块
let { stat, exists, readfile } = require('fs');

// 等同于
let _fs = require('fs');
let stat = _fs.stat;
let exists = _fs.exists;
let readfile = _fs.readfile;
```

`ES6`设计思想是尽量的静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量

```
// ES6模块
import { stat, exists, readFile } from 'fs';
```

上述代码，只加载3个方法，其他方法不加载，即 `ES6` 可以在编译时就完成模块加载

由于编译加载，使得静态分析成为可能。包括现在流行的`typeScript`也是依靠静态分析实现功能

### 二、使用

`ES6`模块内部自动采用了严格模式，这里就不展开严格模式的限制，毕竟这是`ES5`之前就已经规定好

模块功能主要由两个命令构成：

- `export`：用于规定模块的对外接口
- `import`：用于输入其他模块提供的功能

#### export

一个模块就是一个独立的文件，该文件内部的所有变量，外部无法获取。如果你希望外部能够读取模块内部的某个变量，就必须使用`export`关键字输出该变量

```
// profile.js
export var firstName = 'Michael';
export var lastName = 'Jackson';
export var year = 1958;

或 
// 建议使用下面写法，这样能瞬间确定输出了哪些变量
var firstName = 'Michael';
var lastName = 'Jackson';
var year = 1958;

export { firstName, lastName, year };
```

输出函数或类

```
export function multiply(x, y) {
  return x * y;
};
```

通过`as`可以进行输出变量的重命名

```
function v1() { ... }
function v2() { ... }

export {
  v1 as streamV1,
  v2 as streamV2,
  v2 as streamLatestVersion
};
```

#### import

使用`export`命令定义了模块的对外接口以后，其他 JS 文件就可以通过`import`命令加载这个模块

```
// main.js
import { firstName, lastName, year } from './profile.js';

function setName(element) {
  element.textContent = firstName + ' ' + lastName;
}
```

同样如果想要输入变量起别名，通过`as`关键字

```
import { lastName as surname } from './profile.js';
```

当加载整个模块的时候，需要用到星号`*`

```
// circle.js
export function area(radius) {
  return Math.PI * radius * radius;
}

export function circumference(radius) {
  return 2 * Math.PI * radius;
}

// main.js
import * as circle from './circle';
console.log(circle)   // {area:area,circumference:circumference}
```

输入的变量都是只读的，不允许修改，但是如果是对象，允许修改属性

```
import {a} from './xxx.js'

a.foo = 'hello'; // 合法操作
a = {}; // Syntax Error : 'a' is read-only;
```

不过建议即使能修改，但我们不建议。因为修改之后，我们很难差错

`import`后面我们常接着`from`关键字，`from`指定模块文件的位置，可以是相对路径，也可以是绝对路径

```
import { a } from './a';
```

如果只有一个模块名，需要有配置文件，告诉引擎模块的位置

```
import { myMethod } from 'util';
```

在编译阶段，`import`会提升到整个模块的头部，首先执行

```
foo();

import { foo } from 'my_module';
```

多次重复执行同样的导入，只会执行一次

```
import 'lodash';
import 'lodash';
```

上面的情况，大家都能看到用户在导入模块的时候，需要知道加载的变量名和函数，否则无法加载

如果不需要知道变量名或函数就完成加载，就要用到`export default`命令，为模块指定默认输出

```
// export-default.js
export default function () {
    console.log('foo');
}
```

加载该模块的时候，`import`命令可以为该函数指定任意名字

```
// import-default.js
import customName from './export-default';
customName(); // 'foo'
```

#### 动态加载

允许您仅在需要时动态加载模块，而不必预先加载所有模块，这存在明显的性能优势

这个新功能允许您将`import()`作为函数调用，将其作为参数传递给模块的路径。它返回一个 `promise`，它用一个模块对象来实现，让你可以访问该对象的导出

```
import('/modules/myModule.mjs')
  .then((module) => {
    // Do something with the module.
  });
```

#### 复合写法

如果在一个模块之中，先输入后输出同一个模块，`import`语句可以与`export`语句写在一起

```
export { foo, bar } from 'my_module';

// 可以简单理解为
import { foo, bar } from 'my_module';
export { foo, bar };
```

同理能够搭配`as`、`*`搭配使用

### 三、使用场景

如今，`ES6`模块化已经深入我们日常项目开发中，像`vue`、`react`项目搭建项目，组件化开发处处可见，其也是依赖模块化实现

`vue`组件

```
<template>
  <div class="App">
      组件化开发 ---- 模块化
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>
```

`react`组件

```
function App() {
  return (
    <div className="App">
  组件化开发 ---- 模块化
    </div>
  );
}

export default App;
```

包括完成一些复杂应用的时候，我们也可以拆分成各个模块

### 参考文献

- https://macsalvation.net/the-history-of-js-module/
- https://es6.ruanyifeng.com/#docs/module

## 10、你是怎么理解ES6中 Decorator 的？使用场景？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQYvg5aDGk0quib6YImxRflK1KAiautwNuQWwqjOeXuAqHBFF9SJ8iaT8bXbdfWR5LNyBOiamyqWKg7Gg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)



### 一、介绍

Decorator，即装饰器，从名字上很容易让我们联想到装饰者模式

简单来讲，装饰者模式就是一种在不改变原类和使用继承的情况下，动态地扩展对象功能的设计理论。

`ES6`中`Decorator`功能亦如此，其本质也不是什么高大上的结构，就是一个普通的函数，用于扩展类属性和类方法

这里定义一个士兵，这时候他什么装备都没有

```
class soldier{ 
}
```

定义一个得到 AK 装备的函数，即装饰器

```
function strong(target){
    target.AK = true
}
```

使用该装饰器对士兵进行增强

```
@strong
class soldier{
}
```

这时候士兵就有武器了

```
soldier.AK // true
```

上述代码虽然简单，但也能够清晰看到了使用`Decorator`两大优点：

- 代码可读性变强了，装饰器命名相当于一个注释
- 在不改变原有代码情况下，对原来功能进行扩展

### 二、用法

`Docorator`修饰对象为下面两种：

- 类的装饰
- 类属性的装饰

#### 类的装饰

当对类本身进行装饰的时候，能够接受一个参数，即类本身

将装饰器行为进行分解，大家能够有个更深入的了解

```
@decorator
class A {}

// 等同于

class A {}
A = decorator(A) || A;
```

下面`@testable`就是一个装饰器，`target`就是传入的类，即`MyTestableClass`，实现了为类添加静态属性

```
@testable
class MyTestableClass {
  // ...
}

function testable(target) {
  target.isTestable = true;
}

MyTestableClass.isTestable // true
```

如果想要传递参数，可以在装饰器外层再封装一层函数

```
function testable(isTestable) {
  return function(target) {
    target.isTestable = isTestable;
  }
}

@testable(true)
class MyTestableClass {}
MyTestableClass.isTestable // true

@testable(false)
class MyClass {}
MyClass.isTestable // false
```

#### 类属性的装饰

当对类属性进行装饰的时候，能够接受三个参数：

- 类的原型对象
- 需要装饰的属性名
- 装饰属性名的描述对象

首先定义一个`readonly`装饰器

```
function readonly(target, name, descriptor){
  descriptor.writable = false; // 将可写属性设为false
  return descriptor;
}
```

使用`readonly`装饰类的`name`方法

```
class Person {
  @readonly
  name() { return `${this.first} ${this.last}` }
}
```

相当于以下调用

```
readonly(Person.prototype, 'name', descriptor);
```

如果一个方法有多个装饰器，就像洋葱一样，先从外到内进入，再由内到外执行

```
function dec(id){
    console.log('evaluated', id);
    return (target, property, descriptor) =>console.log('executed', id);
}

class Example {
    @dec(1)
    @dec(2)
    method(){}
}
// evaluated 1
// evaluated 2
// executed 2
// executed 1
```

外层装饰器`@dec(1)`先进入，但是内层装饰器`@dec(2)`先执行

#### 注意

装饰器不能用于修饰函数，因为函数存在变量声明情况

```
var counter = 0;

var add = function () {
  counter++;
};

@add
function foo() {
}
```

编译阶段，变成下面

```
var counter;
var add;

@add
function foo() {
}

counter = 0;

add = function () {
  counter++;
};
```

意图是执行后`counter`等于 1，但是实际上结果是`counter`等于 0

### 三、使用场景

基于`Decorator`强大的作用，我们能够完成各种场景的需求，下面简单列举几种：

使用`react-redux`的时候，如果写成下面这种形式，既不雅观也很麻烦

```
class MyReactComponent extends React.Component {}

export default connect(mapStateToProps, mapDispatchToProps)(MyReactComponent);
```

通过装饰器就变得简洁多了

```
@connect(mapStateToProps, mapDispatchToProps)
export default class MyReactComponent extends React.Component {}
```

将`mixins`，也可以写成装饰器，让使用更为简洁了

```
function mixins(...list) {
  return function (target) {
    Object.assign(target.prototype, ...list);
  };
}

// 使用
const Foo = {
  foo() { console.log('foo') }
};

@mixins(Foo)
class MyClass {}

let obj = new MyClass();
obj.foo() // "foo"
```

下面再讲讲`core-decorators.js`几个常见的装饰器

#### @antobind

`autobind`装饰器使得方法中的`this`对象，绑定原始对象

```
import { autobind } from 'core-decorators';

class Person {
  @autobind
  getPerson() {
    return this;
  }
}

let person = new Person();
let getPerson = person.getPerson;

getPerson() === person;
// true
```

#### @readonly

`readonly`装饰器使得属性或方法不可写

```
import { readonly } from 'core-decorators';

class Meal {
  @readonly
  entree = 'steak';
}

var dinner = new Meal();
dinner.entree = 'salmon';
// Cannot assign to read only property 'entree' of [object Object]
```

#### @deprecate

`deprecate`或`deprecated`装饰器在控制台显示一条警告，表示该方法将废除

```
import { deprecate } from 'core-decorators';

class Person {
  @deprecate
  facepalm() {}

  @deprecate('功能废除了')
  facepalmHard() {}
}

let person = new Person();

person.facepalm();
// DEPRECATION Person#facepalm: This function will be removed in future versions.

person.facepalmHard();
// DEPRECATION Person#facepalmHard: 功能废除了
```

### 参考文献

- https://es6.ruanyifeng.com/#docs/decorator

# 六、vue3

## 1、Vue3.0的设计目标是什么？做了哪些优化?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRMZsYzVNUibK0AIzy0PrGtUGkoqhnSW7EEQNgia1icm0NESJYuZOkcbyLiaP8H5WWFl2jKibKjUh7D4tw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、设计目标

不以解决实际业务痛点的更新都是耍流氓，下面我们来列举一下`Vue3`之前我们或许会面临的问题

- 随着功能的增长，复杂组件的代码变得越来越难以维护
- 缺少一种比较「干净」的在多个组件之间提取和复用逻辑的机制
- 类型推断不够友好
- `bundle`的时间太久了

而 `Vue3` 经过长达两三年时间的筹备，做了哪些事情？

我们从结果反推

- 更小
- 更快
- TypeScript支持
- API设计一致性
- 提高自身可维护性
- 开放更多底层功能

一句话概述，就是更小更快更友好了

#### 更小

```
Vue3`移除一些不常用的 `API
```

引入`tree-shaking`，可以将无用模块“剪辑”，仅打包需要的，使打包的整体体积变小了

#### 更快

主要体现在编译方面：

- diff算法优化
- 静态提升
- 事件监听缓存
- SSR优化

下篇文章我们会进一步介绍

#### 更友好

`vue3`在兼顾`vue2`的`options API`的同时还推出了`composition API`，大大增加了代码的逻辑组织和代码复用能力

这里代码简单演示下：

存在一个获取鼠标位置的函数

```
import { toRefs, reactive } from 'vue';
function useMouse(){
    const state = reactive({x:0,y:0});
    const update = e=>{
        state.x = e.pageX;
        state.y = e.pageY;
    }
    onMounted(()=>{
        window.addEventListener('mousemove',update);
    })
    onUnmounted(()=>{
        window.removeEventListener('mousemove',update);
    })

    return toRefs(state);
}
```

我们只需要调用这个函数，即可获取`x`、`y`的坐标，完全不用关注实现过程

试想一下，如果很多类似的第三方库，我们只需要调用即可，不必关注实现过程，开发效率大大提高

同时，`VUE3`是基于`typescipt`编写的，可以享受到自动的类型定义提示

### 三、优化方案

`vue3`从很多层面都做了优化，可以分成三个方面：

- 源码
- 性能
- 语法 API

#### 源码

源码可以从两个层面展开：

- 源码管理
- TypeScript

#### 源码管理

`vue3`整个源码是通过 `monorepo`的方式维护的，根据功能将不同的模块拆分到`packages`目录下面不同的子目录中

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRMZsYzVNUibK0AIzy0PrGtUAiaQKXDvNretTcgW9nic9PeicYibC9AMRxs1ic2xnbSvZmJBdlb6Q82RTFw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

这样使得模块拆分更细化，职责划分更明确，模块之间的依赖关系也更加明确，开发人员也更容易阅读、理解和更改所有模块源码，提高代码的可维护性

另外一些 `package`（比如 `reactivity` 响应式库）是可以独立于 `Vue` 使用的，这样用户如果只想使用 `Vue3`的响应式能力，可以单独依赖这个响应式库而不用去依赖整个 `Vue`

#### TypeScript

`Vue3`是基于`typeScript`编写的，提供了更好的类型检查，能支持复杂的类型推导

#### 性能

`vue3`是从什么哪些方面对性能进行进一步优化呢？

- 体积优化
- 编译优化
- 数据劫持优化

这里讲述数据劫持：

在`vue2`中，数据劫持是通过`Object.defineProperty`，这个 API 有一些缺陷，并不能检测对象属性的添加和删除

```
Object.defineProperty(data, 'a',{
  get(){
    // track
  },
  set(){
    // trigger
  }
})
```

尽管`Vue`为了解决这个问题提供了 `set`和`delete`实例方法，但是对于用户来说，还是增加了一定的心智负担

同时在面对嵌套层级比较深的情况下，就存在性能问题

```
default {
  data: {
    a: {
      b: {
          c: {
          d: 1
        }
      }
    }
  }
}
```

相比之下，`vue3`是通过`proxy`监听整个对象，那么对于删除还是监听当然也能监听到

同时`Proxy` 并不能监听到内部深层次的对象变化，而 `Vue3` 的处理方式是在`getter` 中去递归响应式，这样的好处是真正访问到的内部对象才会变成响应式，而不是无脑递归

#### 语法 API

这里当然说的就是`composition API`，其两大显著的优化：

- 优化逻辑组织
- 优化逻辑复用

#### 逻辑组织

一张图，我们可以很直观地感受到 `Composition API`在逻辑组织方面的优势

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRMZsYzVNUibK0AIzy0PrGtUYyuf2hCg1tjn6iajger8FleO63sNBY6yjHmJw6wKw9fB8V5bXSTgF4w/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

相同功能的代码编写在一块，而不像`options API`那样，各个功能的代码混成一块

#### 逻辑复用

在`vue2`中，我们是通过`mixin`实现功能混合，如果多个`mixin`混合，会存在两个非常明显的问题：命名冲突和数据来源不清晰

而通过`composition`这种形式，可以将一些复用的代码抽离出来作为一个函数，只要的使用的地方直接进行调用即可

同样是上文的获取鼠标位置的例子

```
import { toRefs, reactive, onUnmounted, onMounted } from 'vue';
function useMouse(){
    const state = reactive({x:0,y:0});
    const update = e=>{
        state.x = e.pageX;
        state.y = e.pageY;
    }
    onMounted(()=>{
        window.addEventListener('mousemove',update);
    })
    onUnmounted(()=>{
        window.removeEventListener('mousemove',update);
    })

    return toRefs(state);
}
```

组件使用

```
import useMousePosition from './mouse'
export default {
    setup() {
        const { x, y } = useMousePosition()
        return { x, y }
    }
}
```

可以看到，整个数据来源清晰了，即使去编写更多的`hook`函数，也不会出现命名冲突的问题

### 参考文献

- https://juejin.cn/post/6850418112878575629#heading-5
- https://vue3js.cn/docs/zh

## 2、Vue3.0 性能提升主要是通过哪几方面体现的？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTQTPic6UsQGrmOIJiadhd6PxeOHbKJernibQbDJGNTCq7fKP9XwsuGuxLSQonm7p9kbbeylibiaRXtHTg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、编译阶段

回顾`Vue2`，我们知道每个组件实例都对应一个 `watcher` 实例，它会在组件渲染的过程中把用到的数据`property`记录为依赖，当依赖发生改变，触发`setter`，则会通知`watcher`，从而使关联的组件重新渲染

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTQTPic6UsQGrmOIJiadhd6PxudSvibq6ogZePC3WKQPNyFRhmYgMtbdibcOia6XycKzIQoakw1jFu1B5Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

试想一下，一个组件结构如下图

```
<template>
    <div id="content">
        <p class="text">静态文本</p>
        <p class="text">静态文本</p>
        <p class="text">{{ message }}</p>
        <p class="text">静态文本</p>
        ...
        <p class="text">静态文本</p>
    </div>
</template>
```

可以看到，组件内部只有一个动态节点，剩余一堆都是静态节点，所以这里很多 `diff` 和遍历其实都是不需要的，造成性能浪费

因此，`Vue3`在编译阶段，做了进一步优化。主要有如下：

- diff算法优化
- 静态提升
- 事件监听缓存
- SSR优化

#### diff算法优化

`vue3`在`diff`算法中相比`vue2`增加了静态标记

关于这个静态标记，其作用是为了会发生变化的地方添加一个`flag`标记，下次发生变化的时候直接找该地方进行比较

下图这里，已经标记静态节点的`p`标签在`diff`过程中则不会比较，把性能进一步提高

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTQTPic6UsQGrmOIJiadhd6Px5oddicGU9cBFOe5mfOiaBuW2hF0sdjNoHE3XhhC1BXrVFlSjH3UTsQzw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

关于静态类型枚举如下

```
export const enum PatchFlags {
  TEXT = 1,// 动态的文本节点
  CLASS = 1 << 1,  // 2 动态的 class
  STYLE = 1 << 2,  // 4 动态的 style
  PROPS = 1 << 3,  // 8 动态属性，不包括类名和样式
  FULL_PROPS = 1 << 4,  // 16 动态 key，当 key 变化时需要完整的 diff 算法做比较
  HYDRATE_EVENTS = 1 << 5,  // 32 表示带有事件监听器的节点
  STABLE_FRAGMENT = 1 << 6,   // 64 一个不会改变子节点顺序的 Fragment
  KEYED_FRAGMENT = 1 << 7, // 128 带有 key 属性的 Fragment
  UNKEYED_FRAGMENT = 1 << 8, // 256 子节点没有 key 的 Fragment
  NEED_PATCH = 1 << 9,   // 512
  DYNAMIC_SLOTS = 1 << 10,  // 动态 solt
  HOISTED = -1,  // 特殊标志是负整数表示永远不会用作 diff
  BAIL = -2 // 一个特殊的标志，指代差异算法
}
```

#### 静态提升

`Vue3`中对不参与更新的元素，会做静态提升，只会被创建一次，在渲染时直接复用

这样就免去了重复的创建节点，大型应用会受益于这个改动，免去了重复的创建操作，优化了运行时候的内存占用

```
<span>你好</span>

<div>{{ message }}</div>
```

没有做静态提升之前

```
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock(_Fragment, null, [
    _createVNode("span", null, "你好"),
    _createVNode("div", null, _toDisplayString(_ctx.message), 1 /* TEXT */)
  ], 64 /* STABLE_FRAGMENT */))
}
```

做了静态提升之后

```
const _hoisted_1 = /*#__PURE__*/_createVNode("span", null, "你好", -1 /* HOISTED */)

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock(_Fragment, null, [
    _hoisted_1,
    _createVNode("div", null, _toDisplayString(_ctx.message), 1 /* TEXT */)
  ], 64 /* STABLE_FRAGMENT */))
}

// Check the console for the AST
```

静态内容`_hoisted_1`被放置在`render` 函数外，每次渲染的时候只要取 `_hoisted_1` 即可

同时 `_hoisted_1` 被打上了 `PatchFlag` ，静态标记值为 -1 ，特殊标志是负整数表示永远不会用于 Diff

#### 事件监听缓存

默认情况下绑定事件行为会被视为动态绑定，所以每次都会去追踪它的变化

```
<div>
  <button @click = 'onClick'>点我</button>
</div>
```

没开启事件监听器缓存

```
export const render = /*#__PURE__*/_withId(function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock("div", null, [
    _createVNode("button", { onClick: _ctx.onClick }, "点我", 8 /* PROPS */, ["onClick"])
                                             // PROPS=1<<3,// 8 //动态属性，但不包含类名和样式
  ]))
})
```

开启事件侦听器缓存后

```
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock("div", null, [
    _createVNode("button", {
      onClick: _cache[1] || (_cache[1] = (...args) => (_ctx.onClick(...args)))
    }, "点我")
  ]))
}
```

上述发现开启了缓存后，没有了静态标记。也就是说下次`diff`算法的时候直接使用

#### SSR优化

当静态内容大到一定量级时候，会用`createStaticVNode`方法在客户端去生成一个static node，这些静态`node`，会被直接`innerHtml`，就不需要创建对象，然后根据对象渲染

```
div>
 <div>
  <span>你好</span>
 </div>
 ...  // 很多个静态属性
 <div>
  <span>{{ message }}</span>
 </div>
</div>
```

编译后

```
import { mergeProps as _mergeProps } from "vue"
import { ssrRenderAttrs as _ssrRenderAttrs, ssrInterpolate as _ssrInterpolate } from "@vue/server-renderer"

export function ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _cssVars = { style: { color: _ctx.color }}
  _push(`<div${
    _ssrRenderAttrs(_mergeProps(_attrs, _cssVars))
  }><div><span>你好</span>...<div><span>你好</span><div><span>${
    _ssrInterpolate(_ctx.message)
  }</span></div></div>`)
}
```

### 二、源码体积

相比`Vue2`，`Vue3`整体体积变小了，除了移出一些不常用的API，再重要的是`Tree shanking`

任何一个函数，如`ref`、`reavtived`、`computed`等，仅仅在用到的时候才打包，没用到的模块都被摇掉，打包的整体体积变小

```
import { computed, defineComponent, ref } from 'vue';
export default defineComponent({
    setup(props, context) {
        const age = ref(18)

        let state = reactive({
            name: 'test'
        })

        const readOnlyAge = computed(() => age.value++) // 19

        return {
            age,
            state,
            readOnlyAge
        }
    }
});
```

### 三、响应式系统

`vue2`中采用 `defineProperty`来劫持整个对象，然后进行深度遍历所有属性，给每个属性添加`getter`和`setter`，实现响应式

`vue3`采用`proxy`重写了响应式系统，因为`proxy`可以对整个对象进行监听，所以不需要深度遍历

- 可以监听动态属性的添加
- 可以监听到数组的索引和数组`length`属性
- 可以监听删除属性

关于这两个 API 具体的不同，我们下篇文章会进行一个更加详细的介绍

### 参考文献

- https://juejin.cn/post/6903171037211557895

## 3、Vue3.0里为什么要用 Proxy API 替代 defineProperty API ？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSJjjpSOwPbcEw9AmKB6cUhJX4zM6IS17Xib3PQLdC8WXj4giaGNibLDxNzxcxO09fh27584DokibNl5Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、Object.defineProperty

定义：`Object.defineProperty()` 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象

##### 为什么能实现响应式

通过`defineProperty` 两个属性，`get`及`set`

- get

属性的 getter 函数，当访问该属性时，会调用此函数。执行时不传入任何参数，但是会传入 this 对象（由于继承关系，这里的this并不一定是定义该属性的对象）。该函数的返回值会被用作属性的值

- set

属性的 setter 函数，当属性值被修改时，会调用此函数。该方法接受一个参数（也就是被赋予的新值），会传入赋值时的 this 对象。默认为 undefined

下面通过代码展示：

定义一个响应式函数`defineReactive`

```
function update() {
    app.innerText = obj.foo
}

function defineReactive(obj, key, val) {
    Object.defineProperty(obj, key, {
        get() {
            console.log(`get ${key}:${val}`);
            return val
        },
        set(newVal) {
            if (newVal !== val) {
                val = newVal
                update()
            }
        }
    })
}
```

调用`defineReactive`，数据发生变化触发`update`方法，实现数据响应式

```
const obj = {}
defineReactive(obj, 'foo', '')
setTimeout(()=>{
    obj.foo = new Date().toLocaleTimeString()
},1000)
```

在对象存在多个`key`情况下，需要进行遍历

```
function observe(obj) {
    if (typeof obj !== 'object' || obj == null) {
        return
    }
    Object.keys(obj).forEach(key => {
        defineReactive(obj, key, obj[key])
    })
}
```

如果存在嵌套对象的情况，还需要在`defineReactive`中进行递归

```
function defineReactive(obj, key, val) {
    observe(val)
    Object.defineProperty(obj, key, {
        get() {
            console.log(`get ${key}:${val}`);
            return val
        },
        set(newVal) {
            if (newVal !== val) {
                val = newVal
                update()
            }
        }
    })
}
```

当给`key`赋值为对象的时候，还需要在`set`属性中进行递归

```
set(newVal) {
    if (newVal !== val) {
        observe(newVal) // 新值是对象的情况
        notifyUpdate()
    }
}
```

上述例子能够实现对一个对象的基本响应式，但仍然存在诸多问题

现在对一个对象进行删除与添加属性操作，无法劫持到

```
const obj = {
    foo: "foo",
    bar: "bar"
}
observe(obj)
delete obj.foo // no ok
obj.jar = 'xxx' // no ok
```

当我们对一个数组进行监听的时候，并不那么好使了

```
const arrData = [1,2,3,4,5];
arrData.forEach((val,index)=>{
    defineProperty(arrData,index,val)
})
arrData.push() // no ok
arrData.pop()  // no ok
arrDate[0] = 99 // ok
```

可以看到数据的`api`无法劫持到，从而无法实现数据响应式，

所以在`Vue2`中，增加了`set`、`delete` API，并且对数组`api`方法进行一个重写

还有一个问题则是，如果存在深层的嵌套对象关系，需要深层的进行监听，造成了性能的极大问题

##### 小结

- 检测不到对象属性的添加和删除
- 数组`API`方法无法监听到
- 需要对每个属性进行遍历监听，如果嵌套对象，需要深层监听，造成性能问题

### 二、proxy

`Proxy`的监听是针对一个对象的，那么对这个对象的所有操作会进入监听操作，这就完全可以代理所有属性了

在`ES6`系列中，我们详细讲解过`Proxy`的使用，就不再述说了

下面通过代码进行展示：

定义一个响应式方法`reactive`

```
function reactive(obj) {
    if (typeof obj !== 'object' && obj != null) {
        return obj
    }
    // Proxy相当于在对象外层加拦截
    const observed = new Proxy(obj, {
        get(target, key, receiver) {
            const res = Reflect.get(target, key, receiver)
            console.log(`获取${key}:${res}`)
            return res
        },
        set(target, key, value, receiver) {
            const res = Reflect.set(target, key, value, receiver)
            console.log(`设置${key}:${value}`)
            return res
        },
        deleteProperty(target, key) {
            const res = Reflect.deleteProperty(target, key)
            console.log(`删除${key}:${res}`)
            return res
        }
    })
    return observed
}
```

测试一下简单数据的操作，发现都能劫持

```
const state = reactive({
    foo: 'foo'
})
// 1.获取
state.foo // ok
// 2.设置已存在属性
state.foo = 'fooooooo' // ok
// 3.设置不存在属性
state.dong = 'dong' // ok
// 4.删除属性
delete state.dong // ok
```

再测试嵌套对象情况，这时候发现就不那么 OK 了

```
const state = reactive({
    bar: { a: 1 }
})

// 设置嵌套对象属性
state.bar.a = 10 // no ok
```

如果要解决，需要在`get`之上再进行一层代理

```
function reactive(obj) {
    if (typeof obj !== 'object' && obj != null) {
        return obj
    }
    // Proxy相当于在对象外层加拦截
    const observed = new Proxy(obj, {
        get(target, key, receiver) {
            const res = Reflect.get(target, key, receiver)
            console.log(`获取${key}:${res}`)
            return isObject(res) ? reactive(res) : res
        },
    return observed
}
```

### 三、总结

`Object.defineProperty`只能遍历对象属性进行劫持

```
function observe(obj) {
    if (typeof obj !== 'object' || obj == null) {
        return
    }
    Object.keys(obj).forEach(key => {
        defineReactive(obj, key, obj[key])
    })
}
```

`Proxy`直接可以劫持整个对象，并返回一个新对象，我们可以只操作新的对象达到响应式目的

```
function reactive(obj) {
    if (typeof obj !== 'object' && obj != null) {
        return obj
    }
    // Proxy相当于在对象外层加拦截
    const observed = new Proxy(obj, {
        get(target, key, receiver) {
            const res = Reflect.get(target, key, receiver)
            console.log(`获取${key}:${res}`)
            return res
        },
        set(target, key, value, receiver) {
            const res = Reflect.set(target, key, value, receiver)
            console.log(`设置${key}:${value}`)
            return res
        },
        deleteProperty(target, key) {
            const res = Reflect.deleteProperty(target, key)
            console.log(`删除${key}:${res}`)
            return res
        }
    })
    return observed
}
```

`Proxy`可以直接监听数组的变化（`push`、`shift`、`splice`）

```
const obj = [1,2,3]
const proxtObj = reactive(obj)
obj.psuh(4) // ok
```

`Proxy`有多达13种拦截方法,不限于`apply`、`ownKeys`、`deleteProperty`、`has`等等，这是`Object.defineProperty`不具备的

正因为`defineProperty`自身的缺陷，导致`Vue2`在实现响应式过程需要实现其他的方法辅助（如重写数组方法、增加额外`set`、`delete`方法）

```
// 数组重写
const originalProto = Array.prototype
const arrayProto = Object.create(originalProto)
['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'].forEach(method => {
  arrayProto[method] = function () {
    originalProto[method].apply(this.arguments)
    dep.notice()
  }
});

// set、delete
Vue.set(obj,'bar','newbar')
Vue.delete(obj),'bar')
```

`Proxy` 不兼容IE，也没有 `polyfill`, `defineProperty` 能支持到IE9

### 参考文献

- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

## 4、Vue3.0 所采用的 Composition Api 与 Vue2.x 使用的 Options Api 有什么不同？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTqhyYRnibNwgtC2nJNniaCic3Pk9fsV1CHWAWMgqQIEvXItD61PlMc53IlOqL5kMyvxLdEuZElSQUNg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 开始之前

`Composition API` 可以说是`Vue3`最大的特点，那么为什么要推出`Composition Api`，解决了什么问题？

通常使用`Vue2`开发的项目，普遍会存在以下问题：

- 代码的可读性随着组件变大而变差
- 每一种代码复用的方式，都存在缺点
- TypeScript支持有限

以上通过使用`Composition Api`都能迎刃而解

### 正文

#### 一、Options Api

`Options API`，即大家常说的选项API，即以`vue`为后缀的文件，通过定义`methods`，`computed`，`watch`，`data`等属性与方法，共同处理页面逻辑

如下图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTqhyYRnibNwgtC2nJNniaCic3GMiajrfCRFe18jXJk3ZIFnNPEPGX9P6SMLUkjOdq0rTyNvc1ADQ5yMw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

可以看到`Options`代码编写方式，如果是组件状态，则写在`data`属性上，如果是方法，则写在`methods`属性上...

用组件的选项 (`data`、`computed`、`methods`、`watch`) 组织逻辑在大多数情况下都有效

然而，当组件变得复杂，导致对应属性的列表也会增长，这可能会导致组件难以阅读和理解

#### 二、Composition Api

在 Vue3 Composition API 中，组件根据逻辑功能来组织的，一个功能所定义的所有 API 会放在一起（更加的高内聚，低耦合）

即使项目很大，功能很多，我们都能快速的定位到这个功能所用到的所有 API

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTqhyYRnibNwgtC2nJNniaCic3FcSF9uASfn5RibNBpMYcM0AshbPt5u5wF9GSKYBlU0tVr0hqGzZ1wSw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 三、对比

下面对`Composition Api`与`Options Api`进行两大方面的比较

- 逻辑组织
- 逻辑复用

##### 逻辑组织

**Options API**

假设一个组件是一个大型组件，其内部有很多处理逻辑关注点（对应下图不用颜色）

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTqhyYRnibNwgtC2nJNniaCic3Y5uEHPrmbpqfG6FU5SHTI6ZCtiaeOU5Oh66ylDEwibSsrEOCLhlXldgw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

可以看到，这种碎片化使得理解和维护复杂组件变得困难

选项的分离掩盖了潜在的逻辑问题。此外，在处理单个逻辑关注点时，我们必须不断地“跳转”相关代码的选项块

**Compostion API**

而`Compositon API`正是解决上述问题，将某个逻辑关注点相关的代码全都放在一个函数里，这样当需要修改一个功能时，就不再需要在文件中跳来跳去

下面举个简单例子，将处理`count`属性相关的代码放在同一个函数了

```
function useCount() {
    let count = ref(10);
    let double = computed(() => {
        return count.value * 2;
    });

    const handleConut = () => {
        count.value = count.value * 2;
    };

    console.log(count);

    return {
        count,
        double,
        handleConut,
    };
}
```

组件上中使用`count`

```
export default defineComponent({
    setup() {
        const { count, double, handleConut } = useCount();
        return {
            count,
            double,
            handleConut
        }
    },
});
```

再来一张图进行对比，可以很直观地感受到 `Composition API`在逻辑组织方面的优势，以后修改一个属性功能的时候，只需要跳到控制该属性的方法中即可

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTqhyYRnibNwgtC2nJNniaCic3kIk8loTIJ8oH52C7lAs7icFAHTojXD6ib96rvQBuETm8SrbiaDXT1ibviaA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

**逻辑复用**

在`Vue2`中，我们是用过`mixin`去复用相同的逻辑

下面举个例子，我们会另起一个`mixin.js`文件

```
export const MoveMixin = {
  data() {
    return {
      x: 0,
      y: 0,
    };
  },

  methods: {
    handleKeyup(e) {
      console.log(e.code);
      // 上下左右 x y
      switch (e.code) {
        case "ArrowUp":
          this.y--;
          break;
        case "ArrowDown":
          this.y++;
          break;
        case "ArrowLeft":
          this.x--;
          break;
        case "ArrowRight":
          this.x++;
          break;
      }
    },
  },

  mounted() {
    window.addEventListener("keyup", this.handleKeyup);
  },

  unmounted() {
    window.removeEventListener("keyup", this.handleKeyup);
  },
};
```

然后在组件中使用

```
<template>
  <div>
    Mouse position: x {{ x }} / y {{ y }}
  </div>
</template>
<script>
import mousePositionMixin from './mouse'
export default {
  mixins: [mousePositionMixin]
}
</script>
```

使用单个`mixin`似乎问题不大，但是当我们一个组件混入大量不同的 `mixins` 的时候

```
mixins: [mousePositionMixin, fooMixin, barMixin, otherMixin]
```

会存在两个非常明显的问题：

- 命名冲突
- 数据来源不清晰

现在通过`Compositon API`这种方式改写上面的代码

```
import { onMounted, onUnmounted, reactive } from "vue";
export function useMove() {
  const position = reactive({
    x: 0,
    y: 0,
  });

  const handleKeyup = (e) => {
    console.log(e.code);
    // 上下左右 x y
    switch (e.code) {
      case "ArrowUp":
        // y.value--;
        position.y--;
        break;
      case "ArrowDown":
        // y.value++;
        position.y++;
        break;
      case "ArrowLeft":
        // x.value--;
        position.x--;
        break;
      case "ArrowRight":
        // x.value++;
        position.x++;
        break;
    }
  };

  onMounted(() => {
    window.addEventListener("keyup", handleKeyup);
  });

  onUnmounted(() => {
    window.removeEventListener("keyup", handleKeyup);
  });

  return { position };
}
```

在组件中使用

```
<template>
  <div>
    Mouse position: x {{ x }} / y {{ y }}
  </div>
</template>

<script>
import { useMove } from "./useMove";
import { toRefs } from "vue";
export default {
  setup() {
    const { position } = useMove();
    const { x, y } = toRefs(position);
    return {
      x,
      y,
    };

  },
};
</script>
```

可以看到，整个数据来源清晰了，即使去编写更多的 hook 函数，也不会出现命名冲突的问题

#### 小结

- 在逻辑组织和逻辑复用方面，`Composition API`是优于`Options API`
- 因为`Composition API`几乎是函数，会有更好的类型推断。
- `Composition API`对 `tree-shaking` 友好，代码也更容易压缩
- `Composition API`中见不到`this`的使用，减少了`this`指向不明的情况
- 如果是小型组件，可以继续使用`Options API`，也是十分友好的

## 5、说说Vue 3.0中Treeshaking特性？举例说明一下？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTanQTPJadQ7vqwKHXOeYdDNjVv0ka6H5QktWhId2QiarGsKnUuHwGe49o0pQww7kvicwVUUw4OXFPw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

```
Tree shaking` 是一种通过清除多余代码方式来优化项目打包体积的技术，专业术语叫 `Dead code elimination
```

简单来讲，就是在保持代码运行结果不变的前提下，去除无用的代码

如果把代码打包比作制作蛋糕，传统的方式是把鸡蛋（带壳）全部丢进去搅拌，然后放入烤箱，最后把（没有用的）蛋壳全部挑选并剔除出去

而`treeshaking`则是一开始就把有用的蛋白蛋黄（import）放入搅拌，最后直接作出蛋糕

也就是说 ，`tree shaking` 其实是找出使用的代码

在`Vue2`中，无论我们使用什么功能，它们最终都会出现在生产代码中。主要原因是Vue实例在项目中是单例的，捆绑程序无法检测到该对象的哪些属性在代码中被使用到

```
import Vue from 'vue'
 
Vue.nextTick(() => {})
```

而`Vue3`源码引入`tree shaking`特性，将全局 API 进行分块。如果你不使用其某些功能，它们将不会包含在你的基础包中

```
import { nextTick, observable } from 'vue'
 
nextTick(() => {})
```

### 二、如何做

`Tree shaking`是基于`ES6`模板语法（`import`与`exports`），主要是借助`ES6`模块的静态编译思想，在编译时就能确定模块的依赖关系，以及输入和输出的变量

`Tree shaking`无非就是做了两件事：

- 编译阶段利用`ES6 Module`判断哪些模块已经加载
- 判断那些模块和变量未被使用或者引用，进而删除对应代码

下面就来举个例子：

通过脚手架`vue-cli`安装`Vue2`与`Vue3`项目

```
vue create vue-demo
```

#### Vue2 项目

组件中使用`data`属性

```
<script>
    export default {
        data: () => ({
            count: 1,
        }),
    };
</script>
```

对项目进行打包，体积如下图

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTanQTPJadQ7vqwKHXOeYdD0iagqgMqtuLeMRV11xuBh1IqKKfmXE8SpnWwYoHZDibXO49XcLrD2VIQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

为组件设置其他属性（`compted`、`watch`）

```
export default {
    data: () => ({
        question:"", 
        count: 1,
    }),
    computed: {
        double: function () {
            return this.count * 2;
        },
    },
    watch: {
        question: function (newQuestion, oldQuestion) {
            this.answer = 'xxxx'
        }
};
```

再一次打包，发现打包出来的体积并没有变化

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTanQTPJadQ7vqwKHXOeYdDUxRBaUQPXyzicSWl0U0Zf4NdpZKpicHWOI6ib84s0ccYVm4Fv0PfIOlQA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### Vue3 项目

组件中简单使用

```
import { reactive, defineComponent } from "vue";
export default defineComponent({
  setup() {
    const state = reactive({
      count: 1,
    });
    return {
      state,
    };
  },
});
```

将项目进行打包

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTanQTPJadQ7vqwKHXOeYdDCLxRcX8S4GpJfysiaicBLpLj2bPXWexjyrdhaicjOprcrIibibBiagURP0Pg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在组件中引入`computed`和`watch`

```
import { reactive, defineComponent, computed, watch } from "vue";
export default defineComponent({
  setup() {
    const state = reactive({
      count: 1,
    });
    const double = computed(() => {
      return state.count * 2;
    });

    watch(
      () => state.count,
      (count, preCount) => {
        console.log(count);
        console.log(preCount);
      }
    );
    return {
      state,
      double,
    };
  },
});
```

再次对项目进行打包，可以看到在引入`computer`和`watch`之后，项目整体体积变大了

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTanQTPJadQ7vqwKHXOeYdDBdgBatniar3DmY35zlq6gj7yXmibYt7XMvMADjMufPvddQozwtK6l9Bg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 三、作用

通过`Tree shaking`，`Vue3`给我们带来的好处是：

- 减少程序体积（更小）
- 减少程序执行时间（更快）
- 便于将来对程序架构进行优化（更友好）

### 参考文献

- https://segmentfault.com/a/1190000038962700

## 6、用Vue3.0 写过组件吗？如果想实现一个 Modal你会怎么设计？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRskZWNgdzhNIw0GJwpo2GI7Uf9iabXGOlibluJIBa9nXnaEBm637DZHMxRl15qVibXyyAwNkCsIxibeA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、组件设计

组件就是把图形、非图形的各种逻辑均抽象为一个统一的概念（组件）来实现开发的模式

现在有一个场景，点击新增与编辑都弹框出来进行填写，功能上大同小异，可能只是标题内容或者是显示的主体内容稍微不同

这时候就没必要写两个组件，只需要根据传入的参数不同，组件显示不同内容即可

这样，下次开发相同界面程序时就可以写更少的代码，意味着更高的开发效率，更少的 `Bug`和更少的程序体积

### 二、需求分析

实现一个`Modal`组件，首先确定需要完成的内容：

- 遮罩层
- 标题内容
- 主体内容
- 确定和取消按钮

主体内容需要灵活，所以可以是字符串，也可以是一段 `html` 代码

特点是它们在当前`vue`实例之外独立存在，通常挂载于`body`之上

除了通过引入`import`的形式，我们还可通过`API`的形式进行组件的调用

还可以包括配置全局样式、国际化、与`typeScript`结合

### 三、实现流程

首先看看大致流程：

- 目录结构
- 组件内容
- 实现 API 形式
- 事件处理
- 其他完善

#### 目录结构

`Modal`组件相关的目录结构

```
├── plugins
│   └── modal
│       ├── Content.tsx // 维护 Modal 的内容，用于 h 函数和 jsx 语法
│       ├── Modal.vue // 基础组件
│       ├── config.ts // 全局默认配置
│       ├── index.ts // 入口
│       ├── locale // 国际化相关
│       │   ├── index.ts
│       │   └── lang
│       │       ├── en-US.ts
│       │       ├── zh-CN.ts
│       │       └── zh-TW.ts
│       └── modal.type.ts // ts类型声明相关
```

因为 Modal 会被 `app.use(Modal)` 调用作为一个插件，所以都放在`plugins`目录下

#### 组件内容

首先实现`modal.vue`的主体显示内容大致如下

```
<Teleport to="body" :disabled="!isTeleport">
    <div v-if="modelValue" class="modal">
        <div
             class="mask"
             :style="style"
             @click="maskClose && !loading && handleCancel()"
             ></div>
        <div class="modal__main">
            <div class="modal__title line line--b">
                <span>{{ title || t("r.title") }}</span>
                <span
                      v-if="close"
                      :title="t('r.close')"
                      class="close"
                      @click="!loading && handleCancel()"
                      >✕</span
                    >
            </div>
            <div class="modal__content">
                <Content v-if="typeof content === 'function'" :render="content" />
                <slot v-else>
                    {{ content }}
                </slot>
            </div>
            <div class="modal__btns line line--t">
                <button :disabled="loading" @click="handleConfirm">
                    <span class="loading" v-if="loading"> ❍ </span>{{ t("r.confirm") }}
                </button>
                <button @click="!loading && handleCancel()">
                    {{ t("r.cancel") }}
                </button>
            </div>
        </div>
    </div>
</Teleport>
```

最外层上通过Vue3 `Teleport` 内置组件进行包裹，其相当于传送门，将里面的内容传送至`body`之上

并且从`DOM`结构上来看，把`modal`该有的内容（遮罩层、标题、内容、底部按钮）都实现了

关于主体内容

```
<div class="modal__content">
    <Content v-if="typeof content==='function'"
             :render="content" />
    <slot v-else>
        {{content}}
    </slot>
</div>
```

可以看到根据传入`content`的类型不同，对应显示不同得到内容

最常见的则是通过调用字符串和默认插槽的形式

```
// 默认插槽
<Modal v-model="show"
       title="演示 slot">
    <div>hello world~</div>
</Modal>

// 字符串
<Modal v-model="show"
       title="演示 content"
       content="hello world~" />
```

通过 API 形式调用`Modal`组件的时候，`content`可以使用下面两种

- h 函数

```
$modal.show({
  title: '演示 h 函数',
  content(h) {
    return h(
      'div',
      {
        style: 'color:red;',
        onClick: ($event: Event) => console.log('clicked', $event.target)
      },
      'hello world ~'
    );
  }
});
```

- JSX

```
$modal.show({
  title: '演示 jsx 语法',
  content() {
    return (
      <div
        onClick={($event: Event) => console.log('clicked', $event.target)}
      >
        hello world ~
      </div>
    );
  }
});
```

#### 实现 API 形式

那么组件如何实现`API`形式调用`Modal`组件呢？

在`Vue2`中，我们可以借助`Vue`实例以及`Vue.extend`的方式获得组件实例，然后挂载到`body`上

```
import Modal from './Modal.vue';
const ComponentClass = Vue.extend(Modal);
const instance = new ComponentClass({ el: document.createElement("div") });
document.body.appendChild(instance.$el);
```

虽然`Vue3`移除了`Vue.extend`方法，但可以通过`createVNode`实现

```
import Modal from './Modal.vue';
const container = document.createElement('div');
const vnode = createVNode(Modal);
render(vnode, container);
const instance = vnode.component;
document.body.appendChild(container);
```

在`Vue2`中，可以通过`this`的形式调用全局 API

```
export default {
    install(vue) {
       vue.prototype.$create = create
    }
}
```

而在 Vue3 的 `setup` 中已经没有 `this`概念了，需要调用`app.config.globalProperties`挂载到全局

```
export default {
    install(app) {
        app.config.globalProperties.$create = create
    }
}
```

#### 事件处理

下面再看看看`Modal`组件内部是如何处理「确定」「取消」事件的，既然是`Vue3`，我们可以采用`Compositon API` 形式

```
// Modal.vue
setup(props, ctx) {
  let instance = getCurrentInstance(); // 获得当前组件实例
  onBeforeMount(() => {
    instance._hub = {
      'on-cancel': () => {},
      'on-confirm': () => {}
    };
  });

  const handleConfirm = () => {
    ctx.emit('on-confirm');
    instance._hub['on-confirm']();
  };
  const handleCancel = () => {
    ctx.emit('on-cancel');
    ctx.emit('update:modelValue', false);
    instance._hub['on-cancel']();
  };

  return {
    handleConfirm,
    handleCancel
  };
}
```

在上面代码中，可以看得到除了使用传统`emit`的形式使父组件监听，还可通过`_hub`属性中添加 `on-cancel`，`on-confirm`方法实现在`API`中进行监听

```
app.config.globalProperties.$modal = {
   show({}) {
     /* 监听 确定、取消 事件 */
   }
}
```

下面再来目睹下`_hub`是如何实现

```
// index.ts
app.config.globalProperties.$modal = {
    show({
        /* 其他选项 */
        onConfirm,
        onCancel
    }) {
        /* ... */

        const { props, _hub } = instance;

        const _closeModal = () => {
            props.modelValue = false;
            container.parentNode!.removeChild(container);
        };
        // 往 _hub 新增事件的具体实现
        Object.assign(_hub, {
            async 'on-confirm'() {
            if (onConfirm) {
                const fn = onConfirm();
                // 当方法返回为 Promise
                if (fn && fn.then) {
                    try {
                        props.loading = true;
                        await fn;
                        props.loading = false;
                        _closeModal();
                    } catch (err) {
                        // 发生错误时，不关闭弹框
                        console.error(err);
                        props.loading = false;
                    }
                } else {
                    _closeModal();
                }
            } else {
                _closeModal();
            }
        },
            'on-cancel'() {
                onCancel && onCancel();
                _closeModal();
            }
    });
}
};
```

#### 其他完善

关于组件实现国际化、与`typsScript`结合，大家可以根据自身情况在此基础上进行更改

# 七、js

## 1、Javscript数组的常用方法有哪些？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTw1mC4Cicicf1icV0HKZsxUiboRI2wcNNxkOPOVqqgmFl2iczickUAibKR9RHlPhKQ8HhvgexJUzObxUqvg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

数组基本操作可以归纳为 增、删、改、查，需要留意的是哪些方法会对原数组产生影响，哪些方法不会

下面对数组常用的操作方法做一个归纳

### 增

下面前三种是对原数组产生影响的增添方法，第四种则不会对原数组产生影响

- push()
- unshift()
- splice()
- concat()

#### push()

`push()`方法接收任意数量的参数，并将它们添加到数组末尾，返回数组的最新长度

```
let colors = []; // 创建一个数组
let count = colors.push("red", "green"); // 推入两项
console.log(count) // 2
```

#### unshift()

unshift()在数组开头添加任意多个值，然后返回新的数组长度

```
let colors = new Array(); // 创建一个数组
let count = colors.unshift("red", "green"); // 从数组开头推入两项
alert(count); // 2
```

#### splice

传入三个参数，分别是开始位置、0（要删除的元素数量）、插入的元素，返回空数组

```
let colors = ["red", "green", "blue"];
let removed = colors.splice(1, 0, "yellow", "orange")
console.log(colors) // red,yellow,orange,green,blue
console.log(removed) // []
```

#### concat()

首先会创建一个当前数组的副本，然后再把它的参数添加到副本末尾，最后返回这个新构建的数组，不会影响原始数组

```
let colors = ["red", "green", "blue"];
let colors2 = colors.concat("yellow", ["black", "brown"]);
console.log(colors); // ["red", "green","blue"]
console.log(colors2); // ["red", "green", "blue", "yellow", "black", "brown"]
```

### 删

下面三种都会影响原数组，最后一项不影响原数组：

- pop()
- shift()
- splice()
- slice()

#### pop()

`pop()` 方法用于删除数组的最后一项，同时减少数组的`length` 值，返回被删除的项

```
let colors = ["red", "green"]
let item = colors.pop(); // 取得最后一项
console.log(item) // green
console.log(colors.length) // 1
```

#### shift()

`shift()`方法用于删除数组的第一项，同时减少数组的`length` 值，返回被删除的项

```
let colors = ["red", "green"]
let item = colors.shift(); // 取得第一项
console.log(item) // red
console.log(colors.length) // 1
```

#### splice()

传入两个参数，分别是开始位置，删除元素的数量，返回包含删除元素的数组

```
let colors = ["red", "green", "blue"];
let removed = colors.splice(0,1); // 删除第一项
console.log(colors); // green,blue
console.log(removed); // red，只有一个元素的数组
```

#### slice()

slice() 用于创建一个包含原有数组中一个或多个元素的新数组，不会影响原始数组

```
let colors = ["red", "green", "blue", "yellow", "purple"];
let colors2 = colors.slice(1);
let colors3 = colors.slice(1, 4);
console.log(colors)   // red,green,blue,yellow,purple
concole.log(colors2); // green,blue,yellow,purple
concole.log(colors3); // green,blue,yellow
```

### 改

即修改原来数组的内容，常用`splice`

#### splice()

传入三个参数，分别是开始位置，要删除元素的数量，要插入的任意多个元素，返回删除元素的数组，对原数组产生影响

```
let colors = ["red", "green", "blue"];
let removed = colors.splice(1, 1, "red", "purple"); // 插入两个值，删除一个元素
console.log(colors); // red,red,purple,blue
console.log(removed); // green，只有一个元素的数组
```

### 查

即查找元素，返回元素坐标或者元素值

- indexOf()
- includes()
- find()

#### indexOf()

返回要查找的元素在数组中的位置，如果没找到则返回-1

```
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1];
numbers.indexOf(4) // 3
```

#### includes()

返回要查找的元素在数组中的位置，找到返回`true`，否则`false`

```
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1];
numbers.includes(4) // true
```

#### find()

返回第一个匹配的元素

```
const people = [
    {
        name: "Matt",
        age: 27
    },
    {
        name: "Nicholas",
        age: 29
    }
];
people.find((element, index, array) => element.age < 28) // // {name: "Matt", age: 27}
```

### 二、排序方法

数组有两个方法可以用来对元素重新排序：

- reverse()
- sort()

#### reverse()

顾名思义，将数组元素方向排列

```
let values = [1, 2, 3, 4, 5];
values.reverse();
alert(values); // 5,4,3,2,1
```

#### sort()

sort()方法接受一个比较函数，用于判断哪个值应该排在前面

```
function compare(value1, value2) {
    if (value1 < value2) {
        return -1;
    } else if (value1 > value2) {
        return 1;
    } else {
        return 0;
    }
}
let values = [0, 1, 5, 10, 15];
values.sort(compare);
alert(values); // 0,1,5,10,15
```

### 三、转换方法

常见的转换方法有：

#### join()

join() 方法接收一个参数，即字符串分隔符，返回包含所有项的字符串

```
let colors = ["red", "green", "blue"];
alert(colors.join(",")); // red,green,blue
alert(colors.join("||")); // red||green||blue
```

### 四、迭代方法

常用来迭代数组的方法（都不改变原数组）有如下：

- some()
- every()
- forEach()
- filter()
- map()

#### some()

对数组每一项都运行传入的函数，如果有一项函数返回 true ，则这个方法返回 true

```
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1];
let someResult = numbers.every((item, index, array) => item > 2);
console.log(someResult) // true
```

#### every()

对数组每一项都运行传入的函数，如果对每一项函数都返回 true ，则这个方法返回 true

```
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1];
let everyResult = numbers.every((item, index, array) => item > 2);
console.log(everyResult) // false
```

#### forEach()

对数组每一项都运行传入的函数，没有返回值

```
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1];
numbers.forEach((item, index, array) => {
    // 执行某些操作
});
```

#### filter()

对数组每一项都运行传入的函数，函数返回 `true` 的项会组成数组之后返回

```
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1];
let filterResult = numbers.filter((item, index, array) => item > 2);
console.log(filterResult); // 3,4,5,4,3
```

#### map()

对数组每一项都运行传入的函数，返回由每次函数调用的结果构成的数组

```
let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1];
let mapResult = numbers.map((item, index, array) => item * 2);
console.log(mapResult) // 2,4,6,8,10,8,6,4,2
```

## 2、Javscript字符串的常用方法有哪些？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRdruJicrlniavWwlSEC3CC9QVdgxJh8lhsg0lzEet7kI6fiahKynxTkQiabylBcqRWtrRXic8gX66yS1g/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、操作方法

我们也可将字符串常用的操作方法归纳为增、删、改、查

#### 增

这里增的意思并不是说直接增添内容，而是创建字符串的一个副本，再进行操作

除了常用`+`以及`${}`进行字符串拼接之外，还可通过`concat`

##### concat

用于将一个或多个字符串拼接成一个新字符串

```
let stringValue = "hello ";
let result = stringValue.concat("world");
console.log(result); // "hello world"
console.log(stringValue); // "hello"
```

#### 删

这里的删的意思并不是说删除原字符串的内容，而是创建字符串的一个副本，再进行操作

常见的有：

- slice()
- substr()
- substring()

这三个方法都返回调用它们的字符串的一个子字符串，而且都接收一或两个参数。

```
let stringValue = "hello world";
console.log(stringValue.slice(3)); // "lo world"
console.log(stringValue.substring(3)); // "lo world"
console.log(stringValue.substr(3)); // "lo world"
console.log(stringValue.slice(3, 7)); // "lo w"
console.log(stringValue.substring(3,7)); // "lo w"
console.log(stringValue.substr(3, 7)); // "lo worl"
```

#### 改

这里改的意思也不是改变原字符串，而是创建字符串的一个副本，再进行操作

常见的有：

- trim()、trimLeft()、trimRight()
- repeat()
- padStart()、padEnd()
- toLowerCase()、 toUpperCase()

##### trim()、trimLeft()、trimRight()

删除前、后或前后所有空格符，再返回新的字符串

```
let stringValue = " hello world ";
let trimmedStringValue = stringValue.trim();
console.log(stringValue); // " hello world "
console.log(trimmedStringValue); // "hello world"
```

##### repeat()

接收一个整数参数，表示要将字符串复制多少次，然后返回拼接所有副本后的结果

```
let stringValue = "na ";
let copyResult = stringValue.repeat(2) // na na 
```

##### padEnd()

复制字符串，如果小于指定长度，则在相应一边填充字符，直至满足长度条件

```
let stringValue = "foo";
console.log(stringValue.padStart(6)); // " foo"
console.log(stringValue.padStart(9, ".")); // "......foo"
```

##### toLowerCase()、 toUpperCase()

大小写转化

```
let stringValue = "hello world";
console.log(stringValue.toUpperCase()); // "HELLO WORLD"
console.log(stringValue.toLowerCase()); // "hello world"
```

#### 查

除了通过索引的方式获取字符串的值，还可通过：

- chatAt()
- indexOf()
- startWith()
- includes()

##### charAt()

返回给定索引位置的字符，由传给方法的整数参数指定

```
let message = "abcde";
console.log(message.charAt(2)); // "c"
```

##### indexOf()

从字符串开头去搜索传入的字符串，并返回位置（如果没找到，则返回 -1 ）

```
let stringValue = "hello world";
console.log(stringValue.indexOf("o")); // 4
```

##### startWith()、includes()

从字符串中搜索传入的字符串，并返回一个表示是否包含的布尔值

```
let message = "foobarbaz";
console.log(message.startsWith("foo")); // true
console.log(message.startsWith("bar")); // false
console.log(message.includes("bar")); // true
console.log(message.includes("qux")); // false
```

### 二、转换方法

#### split

把字符串按照指定的分割符，拆分成数组中的每一项

```
let str = "12+23+34"
let arr = str.split("+") // [12,23,34]
```

### 三、模板匹配方法

针对正则表达式，字符串设计了几个方法：

- match()
- search()
- replace()

#### match()

接收一个参数，可以是一个正则表达式字符串，也可以是一个`RegExp`对象，返回数组

```
let text = "cat, bat, sat, fat";
let pattern = /.at/;
let matches = text.match(pattern);
console.log(matches[0]); // "cat"
```

#### search()

接收一个参数，可以是一个正则表达式字符串，也可以是一个`RegExp`对象，找到则返回匹配索引，否则返回 -1

```
let text = "cat, bat, sat, fat";
let pos = text.search(/at/);
console.log(pos); // 1
```

#### replace()

接收两个参数，第一个参数为匹配的内容，第二个参数为替换的元素（可用函数）

```
let text = "cat, bat, sat, fat";
let result = text.replace("at", "ond");
console.log(result); // "cond, bat, sat, fat"
```

## 3、谈谈 JavaScript 中的类型转换机制

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQC0BrNndAG4j8iaok5dc725m6UMz2fumLWF7wa30CXkQJjtBTwUgodhXzdGkQBv52s8OASLIzvDBw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、概述

```
JS`中有六种简单数据类型：`undefined`、`null`、`boolean`、`string`、`number`、`symbol`，以及引用类型：`object
```

但是我们在声明的时候只有一种数据类型，只有到运行期间才会确定当前类型

```
let x = y ? 1 : a;
```

上面代码中，`x`的值在编译阶段是无法获取的，只有等到程序运行时才能知道

虽然变量的数据类型是不确定的，但是各种运算符对数据类型是有要求的，如果运算子的类型与预期不符合，就会触发类型转换机制

常见的类型转换有：

- 强制转换（显示转换）
- 自动转换（隐式转换）

### 二、显示转换

显示转换，即我们很清楚可以看到这里发生了类型的转变，常见的方法有：

- Number()
- parseInt()
- String()
- Boolean()

#### Number()

将任意类型的值转化为数值

先给出类型转换规则：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQC0BrNndAG4j8iaok5dc725PI8iaK64SVFzv5q25ReK5Xl5ur3Qyj2ftVZocIaP8UhGYiaKOFVQN6yQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

实践一下：

```
Number(324) // 324

// 字符串：如果可以被解析为数值，则转换为相应的数值
Number('324') // 324

// 字符串：如果不可以被解析为数值，返回 NaN
Number('324abc') // NaN

// 空字符串转为0
Number('') // 0

// 布尔值：true 转成 1，false 转成 0
Number(true) // 1
Number(false) // 0

// undefined：转成 NaN
Number(undefined) // NaN

// null：转成0
Number(null) // 0

// 对象：通常转换成NaN(除了只包含单个数值的数组)
Number({a: 1}) // NaN
Number([1, 2, 3]) // NaN
Number([5]) // 5
```

从上面可以看到，`Number`转换的时候是很严格的，只要有一个字符无法转成数值，整个字符串就会被转为`NaN`

#### parseInt()

`parseInt`相比`Number`，就没那么严格了，`parseInt`函数逐个解析字符，遇到不能转换的字符就停下来

```
parseInt('32a3') //32
```

#### String()

可以将任意类型的值转化成字符串

给出转换规则图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQC0BrNndAG4j8iaok5dc725zPDWlk5zcG2Xxz6avaibIgyhQaYibvHKEvOwuEyunOiblz3ribRsbH9clw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

实践一下：

```
// 数值：转为相应的字符串
String(1) // "1"

//字符串：转换后还是原来的值
String("a") // "a"

//布尔值：true转为字符串"true"，false转为字符串"false"
String(true) // "true"

//undefined：转为字符串"undefined"
String(undefined) // "undefined"

//null：转为字符串"null"
String(null) // "null"

//对象
String({a: 1}) // "[object Object]"
String([1, 2, 3]) // "1,2,3"
```

#### Boolean()

可以将任意类型的值转为布尔值，转换规则如下：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQC0BrNndAG4j8iaok5dc72502eL0wpRvaaYHM8Vlw29w4Zia4E8emERh7GhwdyDwY6JemDLZpUhsHw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

实践一下：

```
Boolean(undefined) // false
Boolean(null) // false
Boolean(0) // false
Boolean(NaN) // false
Boolean('') // false
Boolean({}) // true
Boolean([]) // true
Boolean(new Boolean(false)) // true
```

### 三、隐式转换

在隐式转换中，我们可能最大的疑惑是 ：何时发生隐式转换？

我们这里可以归纳为两种情况发生隐式转换的场景：

- 比较运算（`==`、`!=`、`>`、`<`）、`if`、`while`需要布尔值地方
- 算术运算（`+`、`-`、`*`、`/`、`%`）

除了上面的场景，还要求运算符两边的操作数不是同一类型

#### 自动转换为布尔值

在需要布尔值的地方，就会将非布尔值的参数自动转为布尔值，系统内部会调用`Boolean`函数

可以得出个小结：

- undefined
- null
- false
- +0
- -0
- NaN
- ""

除了上面几种会被转化成`false`，其他都换被转化成`true`

#### 自动转换成字符串

遇到预期为字符串的地方，就会将非字符串的值自动转为字符串

具体规则是：先将复合类型的值转为原始类型的值，再将原始类型的值转为字符串

常发生在`+`运算中，一旦存在字符串，则会进行字符串拼接操作

```
'5' + 1 // '51'
'5' + true // "5true"
'5' + false // "5false"
'5' + {} // "5[object Object]"
'5' + [] // "5"
'5' + function (){} // "5function (){}"
'5' + undefined // "5undefined"
'5' + null // "5null"
```

#### 自动转换成数值

除了`+`有可能把运算子转为字符串，其他运算符都会把运算子自动转成数值

```
'5' - '2' // 3
'5' * '2' // 10
true - 1  // 0
false - 1 // -1
'1' - 1   // 0
'5' * []    // 0
false / '5' // 0
'abc' - 1   // NaN
null + 1 // 1
undefined + 1 // NaN
null`转为数值时，值为`0` 。`undefined`转为数值时，值为`NaN
```

## 4、== 和 ===区别，分别在什么情况使用？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTs07kibnEgyfFxD2wwYqMh5L8zexesicxiaian17faNTcoHjAZ6eZ7d75LbMOxqXrR9n8xicvkaOyvibHw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、等于操作符

等于操作符用两个等于号（ == ）表示，如果操作数相等，则会返回 `true`

前面文章，我们提到在`JavaScript`中存在隐式转换。等于操作符（==）在比较中会先进行类型转换，再确定操作数是否相等

遵循以下规则：

如果任一操作数是布尔值，则将其转换为数值再比较是否相等

```
let result1 = (true == 1); // true
```

如果一个操作数是字符串，另一个操作数是数值，则尝试将字符串转换为数值，再比较是否相等

```
let result1 = ("55" == 55); // true
```

如果一个操作数是对象，另一个操作数不是，则调用对象的 `valueOf()`方法取得其原始值，再根据前面的规则进行比较

```
let obj = {valueOf:function(){return 1}}
let result1 = (obj == 1); // true
```

`null`和`undefined`相等

```
let result1 = (null == undefined ); // true
```

如果有任一操作数是 `NaN` ，则相等操作符返回 `false`

```
let result1 = (NaN == NaN ); // false
```

如果两个操作数都是对象，则比较它们是不是同一个对象。如果两个操作数都指向同一个对象，则相等操作符返回`true`

```
let obj1 = {name:"xxx"}
let obj2 = {name:"xxx"}
let result1 = (obj1 == obj2 ); // false
```

下面进一步做个小结：

- 两个都为简单类型，字符串和布尔值都会转换成数值，再比较
- 简单类型与引用类型比较，对象转化成其原始类型的值，再比较
- 两个都为引用类型，则比较它们是否指向同一个对象
- null 和 undefined 相等
- 存在 NaN 则返回 false

### 二、全等操作符

全等操作符由 3 个等于号（ === ）表示，只有两个操作数在不转换的前提下相等才返回 `true`。即类型相同，值也需相同

```
let result1 = ("55" === 55); // false，不相等，因为数据类型不同
let result2 = (55 === 55); // true，相等，因为数据类型相同值也相同
```

`undefined` 和 `null` 与自身严格相等

```
let result1 = (null === null)  //true
let result2 = (undefined === undefined)  //true
```

### 三、区别

相等操作符（==）会做类型转换，再进行值的比较，全等运算符不会做类型转换

```
let result1 = ("55" === 55); // false，不相等，因为数据类型不同
let result2 = (55 === 55); // true，相等，因为数据类型相同值也相同
null` 和 `undefined` 比较，相等操作符（==）为`true`，全等为`false
let result1 = (null == undefined ); // true
let result2 = (null  === undefined); // false
```

### 小结

相等运算符隐藏的类型转换，会带来一些违反直觉的结果

```
'' == '0' // false
0 == '' // true
0 == '0' // true

false == 'false' // false
false == '0' // true

false == undefined // false
false == null // false
null == undefined // true

' \t\r\n' == 0 // true
```

但在比较`null`的情况的时候，我们一般使用相等操作符`==`

```
const obj = {};

if(obj.x == null){
  console.log("1");  //执行
}
```

等同于下面写法

```
if(obj.x === null || obj.x === undefined) {
    ...
}
```

使用相等操作符（==）的写法明显更加简洁了

所以，除了在比较对象属性为`null`或者`undefined`的情况下，我们可以使用相等操作符（ == ），其他情况建议一律使用全等操作符（===）

## 5、说说JavaScript中的数据类型？区别？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS4u9Fu32Qme62VicNHTc8xwMlAz1sLOnU6nTKMvXePJlwN4NxUCTz9QVvvVaFus0GohiadkPG1utYg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 前言

在`JavaScript`中，我们可以分成两种类型：

- 基本类型
- 复杂类型

### 一、基本类型

基本类型主要为以下6种：

- Number
- String
- Boolean
- Undefined
- null
- symbol

#### Number

数值最常见的整数类型格式则为十进制，还可以设置八进制（零开头）、十六进制（0x开头）

```
let intNum = 55 // 10进制的55
let num1 = 070 // 8进制的56
let hexNum1 = 0xA //16进制的10
```

浮点类型则在数值汇总必须包含小数点，还可通过科学计数法表示

```
let floatNum1 = 1.1;
let floatNum2 = 0.1;
let floatNum3 = .1; // 有效，但不推荐
let floatNum = 3.125e7; // 等于 31250000
```

在数值类型中，存在一个特殊数值`NaN`，意为“不是数值”，用于表示本来要返回数值的操作失败了（而不是抛出错误）

```
console.log(0/0); // NaN
console.log(-0/+0); // NaN
```

#### Undefined

`Undefined` 类型只有一个值，就是特殊值 `undefined`。当使用 `var`或 `let`声明了变量但没有初始化时，就相当于给变量赋予了 `undefined`值

```
let message;
console.log(message == undefined); // true
```

包含`undefined` 值的变量跟未定义变量是有区别的

```
let message; // 这个变量被声明了，只是值为 undefined

console.log(message); // "undefined"
console.log(age); // 没有声明过这个变量，报错
```

#### String

字符串可以使用双引号（"）、单引号（'）或反引号（`）标示

```
let firstName = "John";
let lastName = 'Jacob';
let lastName = `Jingleheimerschmidt`
```

字符串是不可变的，意思是一旦创建，它们的值就不能变了

```
let lang = "Java";
lang = lang + "Script";  // 先销毁再创建
```

#### Null

```
Null`类型同样只有一个值，即特殊值 `null
```

逻辑上讲， null 值表示一个空对象指针，这也是给`typeof`传一个 `null` 会返回 `"object"` 的原因

```
let car = null;
console.log(typeof car); // "object"
```

`undefined` 值是由 `null`值派生而来

```
console.log(null == undefined); // true
```

只要变量要保存对象，而当时又没有那个对象可保存，就可用 `null`来填充该变量

#### Boolean

```
Boolean`（布尔值）类型有两个字面值：`true` 和`false
```

通过`Boolean`可以将其他类型的数据转化成布尔值

规则如下：

```
数据类型          转换为 true 的值          转换为 false 的值
 String             非空字符串               "" 
 Number     非零数值（包括无穷值）      0 、 NaN 
 Object       任意对象           null
Undefined      N/A （不存在）       undefined
```

#### Symbol

Symbol （符号）是原始值，且符号实例是唯一、不可变的。符号的用途是确保对象属性使用唯一标识符，不会发生属性冲突的危险

```
let genericSymbol = Symbol();
let otherGenericSymbol = Symbol();
console.log(genericSymbol == otherGenericSymbol); // false

let fooSymbol = Symbol('foo');
let otherFooSymbol = Symbol('foo');
console.log(fooSymbol == otherFooSymbol); // false
```

### 二、引用类型

复杂类型统称为`Object`，我们这里主要讲述下面三种：

- Object
- Array
- Function

#### Object

创建`object`常用方式为对象字面量表示法，属性名可以是字符串或数值

```
let person = {
    name: "Nicholas",
    "age": 29,
    5: true
};
```

#### Array

`JavaScript`数组是一组有序的数据，但跟其他语言不同的是，数组中每个槽位可以存储任意类型的数据。并且，数组也是动态大小的，会随着数据添加而自动增长

```
let colors = ["red", 2, {age: 20 }]
colors.push(2)
```

#### Function

函数实际上是对象，每个函数都是 `Function`类型的实例，而 `Function`也有属性和方法，跟其他引用类型一样

函数存在三种常见的表达方式：

- 函数声明

```
// 函数声明
function sum (num1, num2) {
    return num1 + num2;
}
```

- 函数表达式

```
let sum = function(num1, num2) {
    return num1 + num2;
};
```

- 箭头函数

函数声明和函数表达式两种方式

```
let sum = (num1, num2) => {
    return num1 + num2;
};
```

#### 其他引用类型

除了上述说的三种之外，还包括`Date`、`RegExp`、`Map`、`Set`等......

### 三、存储区别

基本数据类型和引用数据类型存储在内存中的位置不同：

- 基本数据类型存储在栈中
- 引用类型的对象存储于堆中

当我们把变量赋值给一个变量时，解析器首先要确认的就是这个值是基本类型值还是引用类型值

下面来举个例子

#### 基本类型

```
let a = 10;
let b = a; // 赋值操作
b = 20;
console.log(a); // 10值
```

`a`的值为一个基本类型，是存储在栈中，将`a`的值赋给`b`，虽然两个变量的值相等，但是两个变量保存了两个不同的内存地址

下图演示了基本类型赋值的过程：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS4u9Fu32Qme62VicNHTc8xwnWwgpianmicToS5Q5mJBdmtiaYKWDqxnHTr8fx271icqOsQG6J20RLED1w/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 引用类型

```
var obj1 = {}
var obj2 = obj1;
obj2.name = "Xxx";
console.log(obj1.name); // xxx
```

引用类型数据存放在堆内存中，每个堆内存中有一个引用地址，该引用地址存放在栈中

`obj1`是一个引用类型，在赋值操作过程汇总，实际是将堆内存对象在栈内存的引用地址复制了一份给了`obj2`，实际上他们共同指向了同一个堆内存对象，所以更改`obj2`会对`obj1`产生影响

下图演示这个引用类型赋值过程

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS4u9Fu32Qme62VicNHTc8xw67RFcibVm3pzibVY05Iu0RyNrQc2A0bVJxmjTS2gKbYytaLNrTibiagmXQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 小结

- 声明变量时不同的内存地址分配：

- - 简单类型的值存放在栈中，在栈中存放的是对应的值
  - 引用类型对应的值存储在堆中，在栈中存放的是指向堆内存的地址

- 不同的类型数据导致赋值变量时的不同：

- - 简单类型赋值，是生成相同的值，两个对象对应不同的地址
  - 复杂类型赋值，是将保存对象的内存地址赋值给另一个变量。也就是两个变量指向堆内存中同一个对象

## 6、深拷贝浅拷贝的区别？如何实现一个深拷贝？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibT0ibjM7Mn7xa5IGnH0oRGy5g64kjBI49hp2HO9N4dpBTEdyex8F8KhzyJn63ficMRHjVXhliaybhhtw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、数据类型存储

`JavaScript`中存在两大数据类型：

- 基本类型
- 引用类型

基本类型数据保存在在栈内存中

引用类型数据保存在堆内存中，引用数据类型的变量是一个指向堆内存中实际对象的引用，存在栈中

### 二、浅拷贝

浅拷贝，指的是创建新的数据，这个数据有着原始数据属性值的一份精确拷贝

如果属性是基本类型，拷贝的就是基本类型的值。如果属性是引用类型，拷贝的就是内存地址

即浅拷贝是拷贝一层，深层次的引用类型则共享内存地址

下面简单实现一个浅拷贝

```
function shallowClone(obj) {
    const newObj = {};
    for(let prop in obj) {
        if(obj.hasOwnProperty(prop)){
            newObj[prop] = obj[prop];
        }
    }
    return newObj;
}
```

在`JavaScript`中，存在浅拷贝的现象有：

- `Object.assign`
- `Array.prototype.slice()`, `Array.prototype.concat()`
- 使用拓展运算符实现的复制

#### Object.assign

```
var obj = {
    age: 18,
    nature: ['smart', 'good'],
    names: {
        name1: 'fx',
        name2: 'xka'
    },
    love: function () {
        console.log('fx is a great girl')
    }
}
var newObj = Object.assign({}, fxObj);
```

#### slice()

```
const fxArr = ["One", "Two", "Three"]
const fxArrs = fxArr.slice(0)
fxArrs[1] = "love";
console.log(fxArr) // ["One", "Two", "Three"]
console.log(fxArrs) // ["One", "love", "Three"]
```

#### concat()

```
const fxArr = ["One", "Two", "Three"]
const fxArrs = fxArr.concat()
fxArrs[1] = "love";
console.log(fxArr) // ["One", "Two", "Three"]
console.log(fxArrs) // ["One", "love", "Three"]
```

#### 拓展运算符

```
const fxArr = ["One", "Two", "Three"]
const fxArrs = [...fxArr]
fxArrs[1] = "love";
console.log(fxArr) // ["One", "Two", "Three"]
console.log(fxArrs) // ["One", "love", "Three"]
```

### 三、深拷贝

深拷贝开辟一个新的栈，两个对象属性完成相同，但是对应两个不同的地址，修改一个对象的属性，不会改变另一个对象的属性

常见的深拷贝方式有：

- _.cloneDeep()
- jQuery.extend()
- JSON.stringify()
- 手写循环递归

#### _.cloneDeep()

```
const _ = require('lodash');
const obj1 = {
    a: 1,
    b: { f: { g: 1 } },
    c: [1, 2, 3]
};
const obj2 = _.cloneDeep(obj1);
console.log(obj1.b.f === obj2.b.f);// false
```

#### jQuery.extend()

```
const $ = require('jquery');
const obj1 = {
    a: 1,
    b: { f: { g: 1 } },
    c: [1, 2, 3]
};
const obj2 = $.extend(true, {}, obj1);
console.log(obj1.b.f === obj2.b.f); // false
```

#### JSON.stringify()

```
const obj2=JSON.parse(JSON.stringify(obj1));
```

但是这种方式存在弊端，会忽略`undefined`、`symbol`和`函数`

```
const obj = {
    name: 'A',
    name1: undefined,
    name3: function() {},
    name4:  Symbol('A')
}
const obj2 = JSON.parse(JSON.stringify(obj));
console.log(obj2); // {name: "A"}
```

#### 循环递归

```
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null) return obj; // 如果是null或者undefined我就不进行拷贝操作
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  // 可能是对象或者普通的值  如果是函数的话是不需要深拷贝
  if (typeof obj !== "object") return obj;
  // 是对象的话就要进行深拷贝
  if (hash.get(obj)) return hash.get(obj);
  let cloneObj = new obj.constructor();
  // 找到的是所属类原型上的constructor,而原型上的 constructor指向的是当前类本身
  hash.set(obj, cloneObj);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 实现一个递归拷贝
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  return cloneObj;
}
```

### 四、区别

下面首先借助两张图，可以更加清晰看到浅拷贝与深拷贝的区别

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibT0ibjM7Mn7xa5IGnH0oRGy5IDXPYnLTUBrphUoPcn3VZicwAy2z28SEhxaRvRAuNhOibCXvrqPxu5hA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

从上图发现，浅拷贝和深拷贝都创建出一个新的对象，但在复制对象属性的时候，行为就不一样

浅拷贝只复制属性指向某个对象的指针，而不复制对象本身，新旧对象还是共享同一块内存，修改对象属性会影响原对象

```
// 浅拷贝
const obj1 = {
    name : 'init',
    arr : [1,[2,3],4],
};
const obj3=shallowClone(obj1) // 一个浅拷贝方法
obj3.name = "update";
obj3.arr[1] = [5,6,7] ; // 新旧对象还是共享同一块内存

console.log('obj1',obj1) // obj1 { name: 'init',  arr: [ 1, [ 5, 6, 7 ], 4 ] }
console.log('obj3',obj3) // obj3 { name: 'update', arr: [ 1, [ 5, 6, 7 ], 4 ] }
```

但深拷贝会另外创造一个一模一样的对象，新对象跟原对象不共享内存，修改新对象不会改到原对象

```
// 深拷贝
const obj1 = {
    name : 'init',
    arr : [1,[2,3],4],
};
const obj4=deepClone(obj1) // 一个深拷贝方法
obj4.name = "update";
obj4.arr[1] = [5,6,7] ; // 新对象跟原对象不共享内存

console.log('obj1',obj1) // obj1 { name: 'init', arr: [ 1, [ 2, 3 ], 4 ] }
console.log('obj4',obj4) // obj4 { name: 'update', arr: [ 1, [ 5, 6, 7 ], 4 ] }
```

### 小结

前提为拷贝类型为引用类型的情况下：

- 浅拷贝是拷贝一层，属性为对象时，浅拷贝是复制，两个对象指向同一个地址
- 深拷贝是递归拷贝深层次，属性为对象时，深拷贝是新开栈，两个对象指向不同的地址

## 7、说说你对闭包的理解？闭包使用场景?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQibeic2A6cuGmpHV8bVwZnLvnG90XznkH0OUVrvqTQrMUGwexjnFMdrStFXPwkxjBuwEWia3Kk0vakA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

一个函数和对其周围状态（lexical environment，词法环境）的引用捆绑在一起（或者说函数被引用包围），这样的组合就是闭包（closure）

也就是说，闭包让你可以在一个内层函数中访问到其外层函数的作用域

在 `JavaScript`中，每当创建一个函数，闭包就会在函数创建的同时被创建出来，作为函数内部与外部连接起来的一座桥梁

下面给出一个简单的例子

```
function init() {
    var name = "Mozilla"; // name 是一个被 init 创建的局部变量
    function displayName() { // displayName() 是内部函数，一个闭包
        alert(name); // 使用了父函数中声明的变量
    }
    displayName();
}
init();
```

`displayName()` 没有自己的局部变量。然而，由于闭包的特性，它可以访问到外部函数的变量

### 二、使用场景

任何闭包的使用场景都离不开这两点：

- 创建私有变量
- 延长变量的生命周期

> ❝
>
> 一般函数的词法环境在函数返回后就被销毁，但是闭包会保存对创建时所在词法环境的引用，即便创建时所在的执行上下文被销毁，但创建时所在词法环境依然存在，以达到延长变量的生命周期的目的
>
> ❞

下面举个例子：

在页面上添加一些可以调整字号的按钮

```
function makeSizer(size) {
  return function() {
    document.body.style.fontSize = size + 'px';
  };
}

var size12 = makeSizer(12);
var size14 = makeSizer(14);
var size16 = makeSizer(16);

document.getElementById('size-12').onclick = size12;
document.getElementById('size-14').onclick = size14;
document.getElementById('size-16').onclick = size16;
```

#### 柯里化函数

柯里化的目的在于避免频繁调用具有相同参数函数的同时，又能够轻松的重用

```
// 假设我们有一个求长方形面积的函数
function getArea(width, height) {
    return width * height
}
// 如果我们碰到的长方形的宽老是10
const area1 = getArea(10, 20)
const area2 = getArea(10, 30)
const area3 = getArea(10, 40)

// 我们可以使用闭包柯里化这个计算面积的函数
function getArea(width) {
    return height => {
        return width * height
    }
}

const getTenWidthArea = getArea(10)
// 之后碰到宽度为10的长方形就可以这样计算面积
const area1 = getTenWidthArea(20)

// 而且如果遇到宽度偶尔变化也可以轻松复用
const getTwentyWidthArea = getArea(20)
```

#### 使用闭包模拟私有方法

在`JavaScript`中，没有支持声明私有变量，但我们可以使用闭包来模拟私有方法

下面举个例子：

```
var Counter = (function() {
  var privateCounter = 0;
  function changeBy(val) {
    privateCounter += val;
  }
  return {
    increment: function() {
      changeBy(1);
    },
    decrement: function() {
      changeBy(-1);
    },
    value: function() {
      return privateCounter;
    }
  }
})();

var Counter1 = makeCounter();
var Counter2 = makeCounter();
console.log(Counter1.value()); /* logs 0 */
Counter1.increment();
Counter1.increment();
console.log(Counter1.value()); /* logs 2 */
Counter1.decrement();
console.log(Counter1.value()); /* logs 1 */
console.log(Counter2.value()); /* logs 0 */
```

上述通过使用闭包来定义公共函数，并令其可以访问私有函数和变量，这种方式也叫模块方式

两个计数器 `Counter1` 和 `Counter2` 是维护它们各自的独立性的，每次调用其中一个计数器时，通过改变这个变量的值，会改变这个闭包的词法环境，不会影响另一个闭包中的变量

#### 其他

例如计数器、延迟调用、回调等闭包的应用，其核心思想还是创建私有变量和延长变量的生命周期

### 三、注意事项

如果不是某些特定任务需要使用闭包，在其它函数中创建函数是不明智的，因为闭包在处理速度和内存消耗方面对脚本性能具有负面影响

例如，在创建新的对象或者类时，方法通常应该关联于对象的原型，而不是定义到对象的构造器中。

原因在于每个对象的创建，方法都会被重新赋值

```
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
  this.getName = function() {
    return this.name;
  };

  this.getMessage = function() {
    return this.message;
  };
}
```

上面的代码中，我们并没有利用到闭包的好处，因此可以避免使用闭包。修改成如下：

```
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
}
MyObject.prototype.getName = function() {
  return this.name;
};
MyObject.prototype.getMessage = function() {
  return this.message;
};
```

## 8、说说你对Javascript中作用域的理解?



![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS8oZj84lR4cM7udejjargnWRfIia5tTuaNibic3icRSoDjyQDRdYghOKvTh99pGQkJ4uc6cf0JezPIvQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、作用域

作用域，即变量（变量作用域又称上下文）和函数生效（能被访问）的区域或集合

换句话说，作用域决定了代码区块中变量和其他资源的可见性

举个例子

```
function myFunction() {
    let inVariable = "函数内部变量";
}
myFunction();//要先执行这个函数，否则根本不知道里面是啥
console.log(inVariable); // Uncaught ReferenceError: inVariable is not defined
```

上述例子中，函数`myFunction`内部创建一个`inVariable`变量，当我们在全局访问这个变量的时候，系统会报错

这就说明我们在全局是无法获取到（闭包除外）函数内部的变量

我们一般将作用域分成：

- 全局作用域
- 函数作用域
- 块级作用域

#### 全局作用域

任何不在函数中或是大括号中声明的变量，都是在全局作用域下，全局作用域下声明的变量可以在程序的任意位置访问

```
// 全局变量
var greeting = 'Hello World!';
function greet() {
  console.log(greeting);
}
// 打印 'Hello World!'
greet();
```

#### 函数作用域

函数作用域也叫局部作用域，如果一个变量是在函数内部声明的它就在一个函数作用域下面。这些变量只能在函数内部访问，不能在函数以外去访问

```
function greet() {
  var greeting = 'Hello World!';
  console.log(greeting);
}
// 打印 'Hello World!'
greet();
// 报错：Uncaught ReferenceError: greeting is not defined
console.log(greeting);
```

可见上述代码中在函数内部声明的变量或函数，在函数外部是无法访问的，这说明在函数内部定义的变量或者方法只是函数作用域

#### 块级作用域

ES6引入了`let`和`const`关键字,和`var`关键字不同，在大括号中使用`let`和`const`声明的变量存在于块级作用域中。在大括号之外不能访问这些变量

```
{
  // 块级作用域中的变量
  let greeting = 'Hello World!';
  var lang = 'English';
  console.log(greeting); // Prints 'Hello World!'
}
// 变量 'English'
console.log(lang);
// 报错：Uncaught ReferenceError: greeting is not defined
console.log(greeting);
```

### 二、词法作用域

词法作用域，又叫静态作用域，变量被创建时就确定好了，而非执行阶段确定的。也就是说我们写好代码时它的作用域就确定了，`JavaScript` 遵循的就是词法作用域

```
var a = 2;
function foo(){
    console.log(a)
}
function bar(){
    var a = 3;
    foo();
}
n()
```

上述代码改变成一张图

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS8oZj84lR4cM7udejjargnPoU8OjzMCvYcrgK0AemgZ8ZOCbNQA5go6fYHk1wy6F4Kf90fnCpKdQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

由于`JavaScript`遵循词法作用域，相同层级的 `foo` 和 `bar` 就没有办法访问到彼此块作用域中的变量，所以输出2

### 三、作用域链

当在`Javascript`中使用一个变量的时候，首先`Javascript`引擎会尝试在当前作用域下去寻找该变量，如果没找到，再到它的上层作用域寻找，以此类推直到找到该变量或是已经到了全局作用域

如果在全局作用域里仍然找不到该变量，它就会在全局范围内隐式声明该变量(非严格模式下)或是直接报错

这里拿《你不知道的Javascript(上)》中的一张图解释：

把作用域比喻成一个建筑，这份建筑代表程序中的嵌套作用域链，第一层代表当前的执行作用域，顶层代表全局作用域

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibS8oZj84lR4cM7udejjargnPWDSvR9txgibhDmiaQY7UaicNn8OFCe9h4Nk2pIe04Ilh1VWJDTcB0KQw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

变量的引用会顺着当前楼层进行查找，如果找不到，则会往上一层找，一旦到达顶层，查找的过程都会停止

下面代码演示下：

```
var sex = '男';
function person() {
    var name = '张三';
    function student() {
        var age = 18;
        console.log(name); // 张三
        console.log(sex); // 男 
    }
    student();
    console.log(age); // Uncaught ReferenceError: age is not defined
}
person();
```

上述代码主要主要做了以下工作：

- `student`函数内部属于最内层作用域，找不到`name`，向上一层作用域`person`函数内部找，找到了输出“张三”
- `student`内部输出cat时找不到，向上一层作用域`person`函数找，还找不到继续向上一层找，即全局作用域，找到了输出“男”
- 在`person`函数内部输出`age`时找不到，向上一层作用域找，即全局作用域，还是找不到则报错

## 9、JavaScript原型，原型链 ? 有什么特点？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibR80MBxyz9h6yMIltdiaLaARy9VgNR98vFpx8EQa5R2wSOjaa7Jiblz7OiaibmUyOF5Isb1ZfiaTfTBWiag/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、原型

`JavaScript` 常被描述为一种基于原型的语言——每个对象拥有一个原型对象

当试图访问一个对象的属性时，它不仅仅在该对象上搜寻，还会搜寻该对象的原型，以及该对象的原型的原型，依次层层向上搜索，直到找到一个名字匹配的属性或到达原型链的末尾

准确地说，这些属性和方法定义在Object的构造器函数（constructor functions）之上的`prototype`属性上，而非实例对象本身

下面举个例子：

函数可以有属性。每个函数都有一个特殊的属性叫作原型`prototype`

```
function doSomething(){}
console.log( doSomething.prototype );
```

控制台输出

```
{
    constructor: ƒ doSomething(),
    __proto__: {
        constructor: ƒ Object(),
        hasOwnProperty: ƒ hasOwnProperty(),
        isPrototypeOf: ƒ isPrototypeOf(),
        propertyIsEnumerable: ƒ propertyIsEnumerable(),
        toLocaleString: ƒ toLocaleString(),
        toString: ƒ toString(),
        valueOf: ƒ valueOf()
    }
}
```

上面这个对象，就是大家常说的原型对象

可以看到，原型对象有一个自有属性`constructor`，这个属性指向该函数，如下图关系展示

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibR80MBxyz9h6yMIltdiaLaARGtqhYiadOFR2dcltsmlwswEfyNOYcdfdJUHOObNPGNraiay09SX4UZ7Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 二、原型链

原型对象也可能拥有原型，并从中继承方法和属性，一层一层、以此类推。这种关系常被称为原型链 (prototype chain)，它解释了为何一个对象会拥有定义在其他对象中的属性和方法

在对象实例和它的构造器之间建立一个链接（它是`__proto__`属性，是从构造函数的`prototype`属性派生的），之后通过上溯原型链，在构造器中找到这些属性和方法

下面举个例子：

```
function Person(name) {
    this.name = name;
    this.age = 18;
    this.sayName = function() {
        console.log(this.name);
    }
}
// 第二步 创建实例
var person = new Person('person')
```

根据代码，我们可以得到下图

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibR80MBxyz9h6yMIltdiaLaAR77pfSibXjbEBeh5sibMXIE5rujG1YV40FGwHek1yIEuvztCH3ohomtEA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

下面分析一下：

- 构造函数`Person`存在原型对象`Person.prototype`
- 构造函数生成实例对象`person`，`person`的`__proto__`指向构造函数`Person`原型对象
- `Person.prototype.__proto__` 指向内置对象，因为 `Person.prototype` 是个对象，默认是由 `Object`函数作为类创建的，而 `Object.prototype` 为内置对象
- `Person.__proto__` 指向内置匿名函数 `anonymous`，因为 Person 是个函数对象，默认由 Function 作为类创建
- `Function.prototype` 和 `Function.__proto__`同时指向内置匿名函数 `anonymous`，这样原型链的终点就是 `null`

### 三、总结

下面首先要看几个概念：

`__proto__`作为不同对象之间的桥梁，用来指向创建它的构造函数的原型对象的

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibR80MBxyz9h6yMIltdiaLaAROQv8evBozagyxgAZY0HIcKoroXThI1FxUJthZF41s7NhGA9tfibDVUQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

每个对象的`__proto__`都是指向它的构造函数的原型对象`prototype`的

```
person1.__proto__ === Person.prototype
```

构造函数是一个函数对象，是通过 `Function`构造器产生的

```
Person.__proto__ === Function.prototype
```

原型对象本身是一个普通对象，而普通对象的构造函数都是`Object`

```
Person.prototype.__proto__ === Object.prototype
```

刚刚上面说了，所有的构造器都是函数对象，函数对象都是 `Function`构造产生的

```
Object.__proto__ === Function.prototype
```

`Object`的原型对象也有`__proto__`属性指向`null`，`null`是原型链的顶端

```
Object.prototype.__proto__ === null
```

下面作出总结：

- 一切对象都是继承自`Object`对象，`Object` 对象直接继承根源对象`null`
- 一切的函数对象（包括 `Object` 对象），都是继承自 `Function` 对象
- `Object` 对象直接继承自 `Function` 对象
- `Function`对象的`__proto__`会指向自己的原型对象，最终还是继承自`Object`对象

## 10、说说Javascript中的继承？如何实现继承？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSPnibW7Mr5w4lh1DtxTGmQMNqDdDPHiarFIDUGyUNWt5BH0j7m2ib9CQTBXjygOwv8b49hLibIml6a0g/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

继承（inheritance）是面向对象软件技术当中的一个概念

如果一个类别B“继承自”另一个类别A，就把这个B称为“A的子类”，而把A称为“B的父类别”也可以称“A是B的超类”

- 继承的优点

继承可以使得子类具有父类别的各种属性和方法，而不需要再次编写相同的代码

在子类别继承父类别的同时，可以重新定义某些属性，并重写某些方法，即覆盖父类别的原有属性和方法，使其获得与父类别不同的功能

虽然`JavaScript`并不是真正的面向对象语言，但它天生的灵活性，使应用场景更加丰富

关于继承，我们举个形象的例子：

定义一个类（Class）叫汽车，汽车的属性包括颜色、轮胎、品牌、速度、排气量等

```
class Car{
    constructor(color,speed){
        this.color = color
        this.speed = speed
        // ...
    }
}
```

由汽车这个类可以派生出“轿车”和“货车”两个类，在汽车的基础属性上，为轿车添加一个后备厢、给货车添加一个大货箱

```
// 货车
class Truck extends Car{
    constructor(color,speed){
        super(color,speed)
        this.Container = true // 货箱
    }
}
```

这样轿车和货车就是不一样的，但是二者都属于汽车这个类，汽车、轿车继承了汽车的属性，而不需要再次在“轿车”中定义汽车已经有的属性

在“轿车”继承“汽车”的同时，也可以重新定义汽车的某些属性，并重写或覆盖某些属性和方法，使其获得与“汽车”这个父类不同的属性和方法

```
class Truck extends Car{
    constructor(color,speed){
        super(color,speed)
        this.color = "black" //覆盖
        this.Container = true // 货箱
    }
}
```

从这个例子中就能详细说明汽车、轿车以及卡车之间的继承关系

### 二、实现方式

下面给出`JavaScripy`常见的继承方式：

- 原型链继承
- 构造函数继承（借助 call）
- 组合继承
- 原型式继承
- 寄生式继承
- 寄生组合式继承

#### 原型链继承

原型链继承是比较常见的继承方式之一，其中涉及的构造函数、原型和实例，三者之间存在着一定的关系，即每一个构造函数都有一个原型对象，原型对象又包含一个指向构造函数的指针，而实例则包含一个原型对象的指针

举个例子

```
 function Parent() {
    this.name = 'parent1';
    this.play = [1, 2, 3]
  }
  function Child() {
    this.type = 'child2';
  }
  Child.prototype = new Parent();
  console.log(new Child())
```

上面代码看似没问题，实际存在潜在问题

```
var s1 = new Child();
var s2 = new Child();
s1.play.push(4);
console.log(s1.play, s2.play); // [1,2,3,4]
```

改变`s1`的`play`属性，会发现`s2`也跟着发生变化了，这是因为两个实例使用的是同一个原型对象，内存空间是共享的

#### 构造函数继承

借助 `call`调用`Parent`函数

```
function Parent(){
    this.name = 'parent1';
}

Parent.prototype.getName = function () {
    return this.name;
}

function Child(){
    Parent1.call(this);
    this.type = 'child'
}

let child = new Child();
console.log(child);  // 没问题
console.log(child.getName());  // 会报错
```

可以看到，父类原型对象中一旦存在父类之前自己定义的方法，那么子类将无法继承这些方法

相比第一种原型链继承方式，父类的引用属性不会被共享，优化了第一种继承方式的弊端，但是只能继承父类的实例属性和方法，不能继承原型属性或者方法

#### 组合继承

前面我们讲到两种继承方式，各有优缺点。组合继承则将前两种方式继承起来

```
function Parent3 () {
    this.name = 'parent3';
    this.play = [1, 2, 3];
}

Parent3.prototype.getName = function () {
    return this.name;
}
function Child3() {
    // 第二次调用 Parent3()
    Parent3.call(this);
    this.type = 'child3';
}

// 第一次调用 Parent3()
Child3.prototype = new Parent3();
// 手动挂上构造器，指向自己的构造函数
Child3.prototype.constructor = Child3;
var s3 = new Child3();
var s4 = new Child3();
s3.play.push(4);
console.log(s3.play, s4.play);  // 不互相影响
console.log(s3.getName()); // 正常输出'parent3'
console.log(s4.getName()); // 正常输出'parent3'
```

这种方式看起来就没什么问题，方式一和方式二的问题都解决了，但是从上面代码我们也可以看到`Parent3` 执行了两次，造成了多构造一次的性能开销

#### 原型式继承

这里主要借助`Object.create`方法实现普通对象的继承

同样举个例子

```
let parent4 = {
    name: "parent4",
    friends: ["p1", "p2", "p3"],
    getName: function() {
      return this.name;
    }
  };

  let person4 = Object.create(parent4);
  person4.name = "tom";
  person4.friends.push("jerry");

  let person5 = Object.create(parent4);
  person5.friends.push("lucy");

  console.log(person4.name); // tom
  console.log(person4.name === person4.getName()); // true
  console.log(person5.name); // parent4
  console.log(person4.friends); // ["p1", "p2", "p3","jerry","lucy"]
  console.log(person5.friends); // ["p1", "p2", "p3","jerry","lucy"]
```

这种继承方式的缺点也很明显，因为`Object.create`方法实现的是浅拷贝，多个实例的引用类型属性指向相同的内存，存在篡改的可能

#### 寄生式继承

寄生式继承在上面继承基础上进行优化，利用这个浅拷贝的能力再进行增强，添加一些方法

```
let parent5 = {
    name: "parent5",
    friends: ["p1", "p2", "p3"],
    getName: function() {
        return this.name;
    }
};

function clone(original) {
    let clone = Object.create(original);
    clone.getFriends = function() {
        return this.friends;
    };
    return clone;
}

let person5 = clone(parent5);

console.log(person5.getName()); // parent5
console.log(person5.getFriends()); // ["p1", "p2", "p3"]
```

其优缺点也很明显，跟上面讲的原型式继承一样

#### 寄生组合式继承

寄生组合式继承，借助解决普通对象的继承问题的`Object.create` 方法，在几种继承方式的优缺点基础上进行改造，这也是所有继承方式里面相对最优的继承方式

```
function clone (parent, child) {
    // 这里改用 Object.create 就可以减少组合继承中多进行一次构造的过程
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
}

function Parent6() {
    this.name = 'parent6';
    this.play = [1, 2, 3];
}
Parent6.prototype.getName = function () {
    return this.name;
}
function Child6() {
    Parent6.call(this);
    this.friends = 'child5';
}

clone(Parent6, Child6);

Child6.prototype.getFriends = function () {
    return this.friends;
}

let person6 = new Child6(); 
console.log(person6); //{friends:"child5",name:"child5",play:[1,2,3],__proto__:Parent6}
console.log(person6.getName()); // parent6
console.log(person6.getFriends()); // child5
```

可以看到 person6 打印出来的结果，属性都得到了继承，方法也没问题

文章一开头，我们是使用`ES6` 中的`extends`关键字直接实现 `JavaScript`的继承

```
class Person {
  constructor(name) {
    this.name = name
  }
  // 原型方法
  // 即 Person.prototype.getName = function() { }
  // 下面可以简写为 getName() {...}
  getName = function () {
    console.log('Person:', this.name)
  }
}
class Gamer extends Person {
  constructor(name, age) {
    // 子类中存在构造函数，则需要在使用“this”之前首先调用 super()。
    super(name)
    this.age = age
  }
}
const asuna = new Gamer('Asuna', 20)
asuna.getName() // 成功访问到父类的方法
```

利用`babel`工具进行转换，我们会发现`extends`实际采用的也是寄生组合继承方式，因此也证明了这种方式是较优的解决继承的方式

### 三、总结

下面以一张图作为总结：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibSPnibW7Mr5w4lh1DtxTGmQM5vfcIEv1t5TeMaXiaFicqhxr1bUYqeicw0Uebiciaiavkib0zIacDVAg3LM1g/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

通过`Object.create` 来划分不同的继承方式，最后的寄生式组合继承方式是通过组合继承改造之后的最优继承方式，而 `extends` 的语法糖和寄生组合继承的方式基本类似

### 相关链接

https://zh.wikipedia.org/wiki/%E7%BB%A7%E6%89%BF

## 11、说说你对Javascript中this对象的理解

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibRaAjZNU0v4x8c8aMxSFfHnROJRWLr8rIj3EYBRQKX1FGl5kuwmsgxHDr2xKrZn1swBFqjJocDl1w/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、定义

函数的 `this` 关键字在 `JavaScript` 中的表现略有不同，此外，在严格模式和非严格模式之间也会有一些差别

在绝大多数情况下，函数的调用方式决定了 `this` 的值（运行时绑定）

`this` 关键字是函数运行时自动生成的一个内部对象，只能在函数内部使用，总指向调用它的对象

举个例子：

```
function baz() {
    // 当前调用栈是：baz
    // 因此，当前调用位置是全局作用域
    
    console.log( "baz" );
    bar(); // <-- bar的调用位置
}

function bar() {
    // 当前调用栈是：baz --> bar
    // 因此，当前调用位置在baz中
    
    console.log( "bar" );
    foo(); // <-- foo的调用位置
}

function foo() {
    // 当前调用栈是：baz --> bar --> foo
    // 因此，当前调用位置在bar中
    
    console.log( "foo" );
}

baz(); // <-- baz的调用位置
```

同时，`this`在函数执行过程中，`this`一旦被确定了，就不可以再更改

```
var a = 10;
var obj = {
  a: 20
}

function fn() {
  this = obj; // 修改this，运行后会报错
  console.log(this.a);
}

fn();
```

### 二、绑定规则

根据不同的使用场合，`this`有不同的值，主要分为下面几种情况：

- 默认绑定
- 隐式绑定
- new绑定
- 显示绑定

#### 默认绑定

全局环境中定义`person`函数，内部使用`this`关键字

```
var name = 'Jenny';
function person() {
    return this.name;
}
console.log(person());  //Jenny
```

上述代码输出`Jenny`，原因是调用函数的对象在游览器中位`window`，因此`this`指向`window`，所以输出`Jenny`

注意：

严格模式下，不能将全局对象用于默认绑定，this会绑定到`undefined`，只有函数运行在非严格模式下，默认绑定才能绑定到全局对象

#### 隐式绑定

函数还可以作为某个对象的方法调用，这时`this`就指这个上级对象

```
function test() {
  console.log(this.x);
}

var obj = {};
obj.x = 1;
obj.m = test;

obj.m(); // 1
```

这个函数中包含多个对象，尽管这个函数是被最外层的对象所调用，`this`指向的也只是它上一级的对象

```
var o = {
    a:10,
    b:{
        fn:function(){
            console.log(this.a); //undefined
        }
    }
}
o.b.fn();
```

上述代码中，`this`的上一级对象为`b`，`b`内部并没有`a`变量的定义，所以输出`undefined`

这里再举一种特殊情况

```
var o = {
    a:10,
    b:{
        a:12,
        fn:function(){
            console.log(this.a); //undefined
            console.log(this); //window
        }
    }
}
var j = o.b.fn;
j();
```

此时`this`指向的是`window`，这里的大家需要记住，`this`永远指向的是最后调用它的对象，虽然`fn`是对象`b`的方法，但是`fn`赋值给`j`时候并没有执行，所以最终指向`window`

#### new绑定

通过构建函数`new`关键字生成一个实例对象，此时`this`指向这个实例对象

```
function test() {
 this.x = 1;
}

var obj = new test();
obj.x // 1
```

上述代码之所以能过输出1，是因为`new`关键字改变了`this`的指向

这里再列举一些特殊情况：

`new`过程遇到`return`一个对象，此时`this`指向为返回的对象

```
function fn()  
{  
    this.user = 'xxx';  
    return {};  
}
var a = new fn();  
console.log(a.user); //undefined
```

如果返回一个简单类型的时候，则`this`指向实例对象

```
function fn()  
{  
    this.user = 'xxx';  
    return 1;
}
var a = new fn;  
console.log(a.user); //xxx
```

注意的是`null`虽然也是对象，但是此时`new`仍然指向实例对象

```
function fn()  
{  
    this.user = 'xxx';  
    return null;
}
var a = new fn;  
console.log(a.user); //xxx
```

#### 显示修改

`apply()、call()、bind()`是函数的一个方法，作用是改变函数的调用对象。它的第一个参数就表示改变后的调用这个函数的对象。因此，这时`this`指的就是这第一个参数

```
var x = 0;
function test() {
 console.log(this.x);
}

var obj = {};
obj.x = 1;
obj.m = test;
obj.m.apply(obj) // 1
```

关于`apply、call、bind`三者的区别，我们后面再详细说

### 三、箭头函数

在 ES6 的语法中还提供了箭头函语法，让我们在代码书写时就能确定 `this` 的指向（编译时绑定）

举个例子：

```
const obj = {
  sayThis: () => {
    console.log(this);
  }
};

obj.sayThis(); // window 因为 JavaScript 没有块作用域，所以在定义 sayThis 的时候，里面的 this 就绑到 window 上去了
const globalSay = obj.sayThis;
globalSay(); // window 浏览器中的 global 对象
```

虽然箭头函数的`this`能够在编译的时候就确定了`this`的指向，但也需要注意一些潜在的坑

下面举个例子：

绑定事件监听

```
const button = document.getElementById('mngb');
button.addEventListener('click', ()=> {
    console.log(this === window) // true
    this.innerHTML = 'clicked button'
})
```

上述可以看到，我们其实是想要`this`为点击的`button`，但此时`this`指向了`window`

包括在原型上添加方法时候，此时`this`指向`window`

```
Cat.prototype.sayName = () => {
    console.log(this === window) //true
    return this.name
}
const cat = new Cat('mm');
cat.sayName()
```

同样的，箭头函数不能作为构建函数

### 四、优先级

#### 隐式绑定 VS 显式绑定

```
function foo() {
    console.log( this.a );
}

var obj1 = {
    a: 2,
    foo: foo
};

var obj2 = {
    a: 3,
    foo: foo
};

obj1.foo(); // 2
obj2.foo(); // 3

obj1.foo.call( obj2 ); // 3
obj2.foo.call( obj1 ); // 2
```

显然，显示绑定的优先级更高

#### new绑定 VS 隐式绑定

```
function foo(something) {
    this.a = something;
}

var obj1 = {
    foo: foo
};

var obj2 = {};

obj1.foo( 2 );
console.log( obj1.a ); // 2

obj1.foo.call( obj2, 3 );
console.log( obj2.a ); // 3

var bar = new obj1.foo( 4 );
console.log( obj1.a ); // 2
console.log( bar.a ); // 4
```

可以看到，new绑定的优先级`>`隐式绑定

#### `new`绑定 VS 显式绑定

因为`new`和`apply、call`无法一起使用，但硬绑定也是显式绑定的一种，可以替换测试

```
function foo(something) {
    this.a = something;
}

var obj1 = {};

var bar = foo.bind( obj1 );
bar( 2 );
console.log( obj1.a ); // 2

var baz = new bar( 3 );
console.log( obj1.a ); // 2
console.log( baz.a ); // 3
bar`被绑定到obj1上，但是`new bar(3)` 并没有像我们预计的那样把`obj1.a`修改为3。但是，`new`修改了绑定调用`bar()`中的`this
```

我们可认为`new`绑定优先级`>`显式绑定

综上，new绑定优先级 > 显示绑定优先级 > 隐式绑定优先级 > 默认绑定优先级

### 相关链接

- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this

## 12、JavaScript中执行上下文和执行栈是什么？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQfjFH0p57efYe0yOErXcSjeUUPMm8hX5TcnL6cFRzFOQ6rNQibSlnKEcgpKiaKws8kROJB1fic3OG9g/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、执行上下文

简单的来说，执行上下文是对`Javascript`代码执行环境的一种抽象概念，只要有`Javascript`代码运行，那么它就一定是运行在执行上下文中

执行上下文的类型分为三种：

- 全局执行上下文：只有一个，浏览器中的全局对象就是 `window`对象，`this` 指向这个全局对象
- 函数执行上下文：存在无数个，只有在函数被调用的时候才会被创建，每次调用函数都会创建一个新的执行上下文
- Eval 函数执行上下文：指的是运行在 `eval` 函数中的代码，很少用而且不建议使用

下面给出全局上下文和函数上下文的例子：

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQfjFH0p57efYe0yOErXcSjuMXicCVjCQxHVic2cKQZ9osnibAic5AO5eSKQnD8TdhT25CMANPibYbhgnA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

紫色框住的部分为全局上下文，蓝色和橘色框起来的是不同的函数上下文。只有全局上下文（的变量）能被其他任何上下文访问

可以有任意多个函数上下文，每次调用函数创建一个新的上下文，会创建一个私有作用域，函数内部声明的任何变量都不能在当前函数作用域外部直接访问

### 二、生命周期

执行上下文的生命周期包括三个阶段：创建阶段 → 执行阶段 → 回收阶段

#### 创建阶段

创建阶段即当函数被调用，但未执行任何其内部代码之前

创建阶段做了三件事：

- 确定 this 的值，也被称为 `This Binding`
- LexicalEnvironment（词法环境） 组件被创建
- VariableEnvironment（变量环境） 组件被创建

伪代码如下：

```
ExecutionContext = {  
  ThisBinding = <this value>,     // 确定this 
  LexicalEnvironment = { ... },   // 词法环境
  VariableEnvironment = { ... },  // 变量环境
}
```

##### This Binding

确定`this`的值我们前面讲到，`this`的值是在执行的时候才能确认，定义的时候不能确认

##### 词法环境

词法环境有两个组成部分：

- 全局环境：是一个没有外部环境的词法环境，其外部环境引用为`null`，有一个全局对象，`this` 的值指向这个全局对象
- 函数环境：用户在函数中定义的变量被存储在环境记录中，包含了`arguments` 对象，外部环境的引用可以是全局环境，也可以是包含内部函数的外部函数环境

伪代码如下：

```
GlobalExectionContext = {  // 全局执行上下文
  LexicalEnvironment: {       // 词法环境
    EnvironmentRecord: {     // 环境记录
      Type: "Object",           // 全局环境
      // 标识符绑定在这里 
      outer: <null>           // 对外部环境的引用
  }  
}

FunctionExectionContext = { // 函数执行上下文
  LexicalEnvironment: {     // 词法环境
    EnvironmentRecord: {    // 环境记录
      Type: "Declarative",      // 函数环境
      // 标识符绑定在这里      // 对外部环境的引用
      outer: <Global or outer function environment reference>  
  }  
}
```

##### 变量环境

变量环境也是一个词法环境，因此它具有上面定义的词法环境的所有属性

在 ES6 中，词法环境和变量环境的区别在于前者用于存储函数声明和变量（ `let` 和 `const` ）绑定，而后者仅用于存储变量（ `var` ）绑定

举个例子

```
let a = 20;  
const b = 30;  
var c;

function multiply(e, f) {  
 var g = 20;  
 return e * f * g;  
}

c = multiply(20, 30);
```

执行上下文如下：

```
GlobalExectionContext = {

  ThisBinding: <Global Object>,

  LexicalEnvironment: {  // 词法环境
    EnvironmentRecord: {  
      Type: "Object",  
      // 标识符绑定在这里  
      a: < uninitialized >,  
      b: < uninitialized >,  
      multiply: < func >  
    }  
    outer: <null>  
  },

  VariableEnvironment: {  // 变量环境
    EnvironmentRecord: {  
      Type: "Object",  
      // 标识符绑定在这里  
      c: undefined,  
    }  
    outer: <null>  
  }  
}

FunctionExectionContext = {  
   
  ThisBinding: <Global Object>,

  LexicalEnvironment: {  
    EnvironmentRecord: {  
      Type: "Declarative",  
      // 标识符绑定在这里  
      Arguments: {0: 20, 1: 30, length: 2},  
    },  
    outer: <GlobalLexicalEnvironment>  
  },

  VariableEnvironment: {  
    EnvironmentRecord: {  
      Type: "Declarative",  
      // 标识符绑定在这里  
      g: undefined  
    },  
    outer: <GlobalLexicalEnvironment>  
  }  
}
```

留意上面的代码，`let`和`const`定义的变量`a`和`b`在创建阶段没有被赋值，但`var`声明的变量从在创建阶段被赋值为`undefined`

这是因为，创建阶段，会在代码中扫描变量和函数声明，然后将函数声明存储在环境中

但变量会被初始化为`undefined`(`var`声明的情况下)和保持`uninitialized`(未初始化状态)(使用`let`和`const`声明的情况下)

这就是变量提升的实际原因

#### 执行阶段

在这阶段，执行变量赋值、代码执行

如果 `Javascript` 引擎在源代码中声明的实际位置找不到变量的值，那么将为其分配 `undefined` 值

#### 回收阶段

执行上下文出栈等待虚拟机回收执行上下文

### 二、执行栈

执行栈，也叫调用栈，具有 LIFO（后进先出）结构，用于存储在代码执行期间创建的所有执行上下文

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQfjFH0p57efYe0yOErXcSjWDNvMMxelnVn1dJEhQLkaOoyNT5nE4ZRWnBMFlxcnhg0wLbpKNpDZw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

当`Javascript`引擎开始执行你第一行脚本代码的时候，它就会创建一个全局执行上下文然后将它压到执行栈中

每当引擎碰到一个函数的时候，它就会创建一个函数执行上下文，然后将这个执行上下文压到执行栈中

引擎会执行位于执行栈栈顶的执行上下文(一般是函数执行上下文)，当该函数执行结束后，对应的执行上下文就会被弹出，然后控制流程到达执行栈的下一个执行上下文

举个例子：

```
let a = 'Hello World!';
function first() {
  console.log('Inside first function');
  second();
  console.log('Again inside first function');
}
function second() {
  console.log('Inside second function');
}
first();
console.log('Inside Global Execution Context');
```

转化成图的形式

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQfjFH0p57efYe0yOErXcSjwjHLXhGHoJQT4X9DqRF6xLDrMTWDAUDEMibo6vS91d2vxGegZRTeXWw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

简单分析一下流程：

- 创建全局上下文请压入执行栈
- `first`函数被调用，创建函数执行上下文并压入栈
- 执行`first`函数过程遇到`second`函数，再创建一个函数执行上下文并压入栈
- `second`函数执行完毕，对应的函数执行上下文被推出执行栈，执行下一个执行上下文`first`函数
- `first`函数执行完毕，对应的函数执行上下文也被推出栈中，然后执行全局上下文
- 所有代码执行完毕，全局上下文也会被推出栈中，程序结束

### 参考文献

- https://zhuanlan.zhihu.com/p/107552264

## 13、JavaScript中的事件模型如何理解?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTnJGOQQxt89ic18DOq4z2iaYZy5HOvicM5xtmBGom0awO0rzTpDo3nmRKlhMLXInLQdJPu0DBwPKd4A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、事件与事件流

`javascript`中的事件，可以理解就是在`HTML`文档或者浏览器中发生的一种交互操作，使得网页具备互动性， 常见的有加载事件、鼠标事件、自定义事件等

由于`DOM`是一个树结构，如果在父子节点绑定事件时候，当触发子节点的时候，就存在一个顺序问题，这就涉及到了事件流的概念

事件流都会经历三个阶段：

- 事件捕获阶段(capture phase)
- 处于目标阶段(target phase)
- 事件冒泡阶段(bubbling phase)

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTnJGOQQxt89ic18DOq4z2iaYZnVPcYqqOsGmtPfNZAZibAebkFv739m9MEZHchu2mlxS3y9o9U2MT7Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

事件冒泡是一种从下往上的传播方式，由最具体的元素（触发节点）然后逐渐向上传播到最不具体的那个节点，也就是`DOM`中最高层的父节点

```
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Event Bubbling</title>
    </head>
    <body>
        <button id="clickMe">Click Me</button>
    </body>
</html>
```

然后，我们给`button`和它的父元素，加入点击事件

```
var button = document.getElementById('clickMe');

button.onclick = function() {
  console.log('1.Button');
};
document.body.onclick = function() {
  console.log('2.body');
};
document.onclick = function() {
  console.log('3.document');
};
window.onclick = function() {
  console.log('4.window');
};
```

点击按钮，输出如下

```
1.button
2.body
3.document
4.window
```

点击事件首先在`button`元素上发生，然后逐级向上传播

事件捕获与事件冒泡相反，事件最开始由不太具体的节点最早接收事件, 而最具体的节点（触发节点）最后接收事件

### 二、事件模型

事件模型可以分为三种：

- 原始事件模型（DOM0级）
- 标准事件模型（DOM2级）
- IE事件模型（基本不用）

#### 原始事件模型

事件绑定监听函数比较简单, 有两种方式：

- HTML代码中直接绑定

```
<input type="button" onclick="fun()">
```

- 通过`JS`代码绑定

```
var btn = document.getElementById('.btn');
btn.onclick = fun;
```

##### 特性

- 绑定速度快

`DOM0`级事件具有很好的跨浏览器优势，会以最快的速度绑定，但由于绑定速度太快，可能页面还未完全加载出来，以至于事件可能无法正常运行

- 只支持冒泡，不支持捕获
- 同一个类型的事件只能绑定一次

```
<input type="button" id="btn" onclick="fun1()">

var btn = document.getElementById('.btn');
btn.onclick = fun2;
```

如上，当希望为同一个元素绑定多个同类型事件的时候（上面的这个`btn`元素绑定2个点击事件），是不被允许的，后绑定的事件会覆盖之前的事件

删除 `DOM0` 级事件处理程序只要将对应事件属性置为`null`即可

```
btn.onclick = null;
```

#### 标准事件模型

在该事件模型中，一次事件共有三个过程:

- 事件捕获阶段：事件从`document`一直向下传播到目标元素, 依次检查经过的节点是否绑定了事件监听函数，如果有则执行
- 事件处理阶段：事件到达目标元素, 触发目标元素的监听函数
- 事件冒泡阶段：事件从目标元素冒泡到`document`, 依次检查经过的节点是否绑定了事件监听函数，如果有则执行

事件绑定监听函数的方式如下:

```
addEventListener(eventType, handler, useCapture)
```

事件移除监听函数的方式如下:

```
removeEventListener(eventType, handler, useCapture)
```

参数如下：

- `eventType`指定事件类型(不要加on)
- `handler`是事件处理函数
- `useCapture`是一个`boolean`用于指定是否在捕获阶段进行处理，一般设置为`false`与IE浏览器保持一致

举个例子：

```
var btn = document.getElementById('.btn');
btn.addEventListener(‘click’, showMessage, false);
btn.removeEventListener(‘click’, showMessage, false);
```

##### 特性

- 可以在一个`DOM`元素上绑定多个事件处理器，各自并不会冲突

```
btn.addEventListener(‘click’, showMessage1, false);
btn.addEventListener(‘click’, showMessage2, false);
btn.addEventListener(‘click’, showMessage3, false);
```

- 执行时机

当第三个参数(`useCapture`)设置为`true`就在捕获过程中执行，反之在冒泡过程中执行处理函数

下面举个例子：

```
<div id='div'>
    <p id='p'>
        <span id='span'>Click Me!</span>
    </p>
</div>
```

设置点击事件

```
var div = document.getElementById('div');
var p = document.getElementById('p');

function onClickFn (event) {
    var tagName = event.currentTarget.tagName;
    var phase = event.eventPhase;
    console.log(tagName, phase);
}

div.addEventListener('click', onClickFn, false);
p.addEventListener('click', onClickFn, false);
```

上述使用了`eventPhase`，返回一个代表当前执行阶段的整数值。1为捕获阶段、2为事件对象触发阶段、3为冒泡阶段

点击`Click Me!`，输出如下

```
P 3
DIV 3
```

可以看到，`p`和`div`都是在冒泡阶段响应了事件，由于冒泡的特性，裹在里层的`p`率先做出响应

如果把第三个参数都改为`true`

```
div.addEventListener('click', onClickFn, true);
p.addEventListener('click', onClickFn, true);
```

输出如下

```
DIV 1
P 1
```

两者都是在捕获阶段响应事件，所以`div`比`p`标签先做出响应

#### IE事件模型

IE事件模型共有两个过程:

- 事件处理阶段：事件到达目标元素, 触发目标元素的监听函数。
- 事件冒泡阶段：事件从目标元素冒泡到`document`, 依次检查经过的节点是否绑定了事件监听函数，如果有则执行

事件绑定监听函数的方式如下:

```
attachEvent(eventType, handler)
```

事件移除监听函数的方式如下:

```
detachEvent(eventType, handler)
```

举个例子：

```
var btn = document.getElementById('.btn');
btn.attachEvent(‘onclick’, showMessage);
btn.detachEvent(‘onclick’, showMessage);
```

## 14、说说 typeof 与 instanceof 区别?

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibTqJ0Ab6sXDia7ZGdUaD4WSqjHWAuqbhZictNlB5dKM9h8YH2iclkumd4icXMKyPBZN1Ag3OCjHIsdVCA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、typeof

`typeof` 操作符返回一个字符串，表示未经计算的操作数的类型

使用方法如下：

```
typeof operand
typeof(operand)
```

`operand`表示对象或原始值的表达式，其类型将被返回

举个例子

```
typeof 1 // 'number'
typeof '1' // 'string'
typeof undefined // 'undefined'
typeof true // 'boolean'
typeof Symbol() // 'symbol'
typeof null // 'object'
typeof [] // 'object'
typeof {} // 'object'
typeof console // 'object'
typeof console.log // 'function'
```

从上面例子，前6个都是基础数据类型。虽然`typeof null`为`object`，但这只是`JavaScript` 存在的一个悠久 `Bug`，不代表`null`就是引用数据类型，并且`null`本身也不是对象

所以，`null`在 `typeof`之后返回的是有问题的结果，不能作为判断`null`的方法。如果你需要在 `if` 语句中判断是否为 `null`，直接通过`===null`来判断就好

同时，可以发现引用类型数据，用`typeof`来判断的话，除了`function`会被识别出来之外，其余的都输出`object`

如果我们想要判断一个变量是否存在，可以使用`typeof`：(不能使用`if(a)`， 若`a`未声明，则报错)

```
if(typeof a != 'undefined'){
    //变量存在
}
```

### 二、instanceof

`instanceof` 运算符用于检测构造函数的 `prototype` 属性是否出现在某个实例对象的原型链上

使用如下：

```
object instanceof constructor
```

`object`为实例对象，`constructor`为构造函数

构造函数通过`new`可以实例对象，`instanceof`能判断这个对象是否是之前那个构造函数生成的对象

```
// 定义构建函数
let Car = function() {}
let benz = new Car()
benz instanceof Car // true
let car = new String('xxx')
car instanceof String // true
let str = 'xxx'
str instanceof String // false
```

关于`instanceof`的实现原理，可以参考下面：

```
function myInstanceof(left, right) {
    // 这里先用typeof来判断基础数据类型，如果是，直接返回false
    if(typeof left !== 'object' || left === null) return false;
    // getProtypeOf是Object对象自带的API，能够拿到参数的原型对象
    let proto = Object.getPrototypeOf(left);
    while(true) {                  
        if(proto === null) return false;
        if(proto === right.prototype) return true;//找到相同原型对象，返回true
        proto = Object.getPrototypeof(proto);
    }
}
```

也就是顺着原型链去找，直到找到相同的原型对象，返回`true`，否则为`false`

### 三、区别

`typeof`与`instanceof`都是判断数据类型的方法，区别如下：

- `typeof`会返回一个变量的基本类型，`instanceof`返回的是一个布尔值
- `instanceof` 可以准确地判断复杂引用数据类型，但是不能正确判断基础数据类型
- 而`typeof` 也存在弊端，它虽然可以判断基础数据类型（`null` 除外），但是引用数据类型中，除了`function` 类型以外，其他的也无法判断

可以看到，上述两种方法都有弊端，并不能满足所有场景的需求

如果需要通用检测数据类型，可以采用`Object.prototype.toString`，调用该方法，统一返回格式`“[object Xxx]”`的字符串

如下

```
Object.prototype.toString({})       // "[object Object]"
Object.prototype.toString.call({})  // 同上结果，加上call也ok
Object.prototype.toString.call(1)    // "[object Number]"
Object.prototype.toString.call('1')  // "[object String]"
Object.prototype.toString.call(true)  // "[object Boolean]"
Object.prototype.toString.call(function(){})  // "[object Function]"
Object.prototype.toString.call(null)   //"[object Null]"
Object.prototype.toString.call(undefined) //"[object Undefined]"
Object.prototype.toString.call(/123/g)    //"[object RegExp]"
Object.prototype.toString.call(new Date()) //"[object Date]"
Object.prototype.toString.call([])       //"[object Array]"
Object.prototype.toString.call(document)  //"[object HTMLDocument]"
Object.prototype.toString.call(window)   //"[object Window]"
```

了解了`toString`的基本用法，下面就实现一个全局通用的数据类型判断方法

```
function getType(obj){
  let type  = typeof obj;
  if (type !== "object") {    // 先进行typeof判断，如果是基础数据类型，直接返回
    return type;
  }
  // 对于typeof返回结果是object的，再进行如下的判断，正则返回结果
  return Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1'); 
}
```

使用如下

```
getType([])     // "Array" typeof []是object，因此toString返回
getType('123')  // "string" typeof 直接返回
getType(window) // "Window" toString返回
getType(null)   // "Null"首字母大写，typeof null是object，需toString来判断
getType(undefined)   // "undefined" typeof 直接返回
getType()            // "undefined" typeof 直接返回
getType(function(){}) // "function" typeof能判断，因此首字母小写
getType(/123/g)      //"RegExp" toString返回
```

## 15、解释下什么是事件代理？应用场景？

![图片](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQLRqhLWGvgz9uVavFq3exMVAQmuxiauiaeDZ228ibKmsjVWF0n53TJLlp3pKlPLV9eMeul0ic43Lh4fw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 一、是什么

事件代理，俗地来讲，就是把一个元素响应事件（`click`、`keydown`......）的函数委托到另一个元素

前面讲到，事件流的都会经过三个阶段：捕获阶段 -> 目标阶段 -> 冒泡阶段，而事件委托就是在冒泡阶段完成

事件委托，会把一个或者一组元素的事件委托到它的父层或者更外层元素上，真正绑定事件的是外层元素，而不是目标元素

当事件响应到目标元素上时，会通过事件冒泡机制从而触发它的外层元素的绑定事件上，然后在外层元素上去执行函数

下面举个例子：

比如一个宿舍的同学同时快递到了，一种笨方法就是他们一个个去领取

较优方法就是把这件事情委托给宿舍长，让一个人出去拿好所有快递，然后再根据收件人一一分发给每个同学

在这里，取快递就是一个事件，每个同学指的是需要响应事件的 `DOM`元素，而出去统一领取快递的宿舍长就是代理的元素

所以真正绑定事件的是这个元素，按照收件人分发快递的过程就是在事件执行中，需要判断当前响应的事件应该匹配到被代理元素中的哪一个或者哪几个

### 二、应用场景

如果我们有一个列表，列表之中有大量的列表项，我们需要在点击列表项的时候响应一个事件

```
<ul id="list">
  <li>item 1</li>
  <li>item 2</li>
  <li>item 3</li>
  ......
  <li>item n</li>
</ul>
```

如果给每个列表项一一都绑定一个函数，那对于内存消耗是非常大的

```
// 获取目标元素
const lis = document.getElementsByTagName("li")
// 循环遍历绑定事件
for (let i = 0; i < lis.length; i++) {
    lis[i].onclick = function(e){
        console.log(e.target.innerHTML)
    }
}
```

这时候就可以事件委托，把点击事件绑定在父级元素`ul`上面，然后执行事件的时候再去匹配目标元素

```
// 给父层元素绑定事件
document.getElementById('list').addEventListener('click', function (e) {
    // 兼容性处理
    var event = e || window.event;
    var target = event.target || event.srcElement;
    // 判断是否匹配目标元素
    if (target.nodeName.toLocaleLowerCase === 'li') {
        console.log('the content is: ', target.innerHTML);
    }
});
```

还有一种场景是上述列表项并不多，我们给每个列表项都绑定了事件

但是如果用户能够随时动态的增加或者去除列表项元素，那么在每一次改变的时候都需要重新给新增的元素绑定事件，给即将删去的元素解绑事件

如果用了事件委托就没有这种麻烦了，因为事件是绑定在父层的，和目标元素的增减是没有关系的，执行到目标元素是在真正响应执行事件函数的过程中去匹配的

举个例子：

下面`html`结构中，点击`input`可以动态添加元素

```
<input type="button" name="" id="btn" value="添加" />
<ul id="ul1">
    <li>item 1</li>
    <li>item 2</li>
    <li>item 3</li>
    <li>item 4</li>
</ul>
```

使用事件委托

```
const oBtn = document.getElementById("btn");
const oUl = document.getElementById("ul1");
const num = 4;

//事件委托，添加的子元素也有事件
oUl.onclick = function (ev) {
    ev = ev || window.event;
    const target = ev.target || ev.srcElement;
    if (target.nodeName.toLowerCase() == 'li') {
        console.log('the content is: ', target.innerHTML);
    }

};

//添加新节点
oBtn.onclick = function () {
    num++;
    const oLi = document.createElement('li');
    oLi.innerHTML = `item ${num}`;
    oUl.appendChild(oLi);
};
```

可以看到，使用事件委托，在动态绑定事件的情况下是可以减少很多重复工作的

### 三、总结

适合事件委托的事件有：`click`，`mousedown`，`mouseup`，`keydown`，`keyup`，`keypress`

从上面应用场景中，我们就可以看到使用事件委托存在两大优点：

- 减少整个页面所需的内存，提升整体性能
- 动态绑定，减少重复工作

但是使用事件委托也是存在局限性：

- `focus`、`blur`这些事件没有事件冒泡机制，所以无法进行委托绑定事件
- `mousemove`、`mouseout`这样的事件，虽然有事件冒泡，但是只能不断通过位置去计算定位，对性能消耗高，因此也是不适合于事件委托的

## 16、说说new操作符具体都干了什么？

