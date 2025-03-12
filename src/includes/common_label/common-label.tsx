import "../../includes/styles.css";

interface CommonLabelInterface {
  text: string;
  size?: "small" | "medium" | "large";
  style?: React.CSSProperties | undefined;
}

export const CommonLabel = ({ style, text, size }: CommonLabelInterface) => {
  return (
    <label className={`${`label-style `} label-`+ size} style={style}>
      {text}
    </label>
  );
};
