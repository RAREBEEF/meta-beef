import styles from "./App.module.scss";
import classNames from "classnames";

function App() {
  return <div className={classNames(styles.App, styles.container)}></div>;
}

export default App;
