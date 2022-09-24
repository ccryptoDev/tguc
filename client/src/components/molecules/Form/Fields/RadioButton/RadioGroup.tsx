import React from "react";
import { Radio } from "./index";

interface IRadioGroup {
  options: { text: string; id: string; value: string }[];
  name: string;
  onChange: any;
  currentSelection: string;
}

const RadioGroup = ({
  options,
  onChange,
  name,
  currentSelection,
}: IRadioGroup) => {
  return (
    <div>
      {options.map((opt) => {
        return (
          <Radio
            key={opt.id}
            name={opt.id}
            selected={currentSelection}
            text={opt.text}
            value={opt.value}
            onChange={(e: any) =>
              onChange({ target: { value: e.target.value, name } })
            }
          />
        );
      })}
    </div>
  );
};

export default RadioGroup;
