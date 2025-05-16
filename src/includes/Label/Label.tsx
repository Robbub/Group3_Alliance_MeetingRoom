import "./label.css";

interface CommonLabelInterface {
  text: string;
  size?: "small" | "medium" | "large";
  style?: React.CSSProperties | undefined;
}

export const Label = ({ style, text, size }: CommonLabelInterface) => {
  return (
    <label className={`${`label-style `} label-` + size} style={style}>
      {text}
    </label>
  );
};
