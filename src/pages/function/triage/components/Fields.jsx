import Demographics from "./fields/Demographics";
import Symptoms from "./fields/Symptoms";
import Questions from "./fields/Questions";
import Loading from "./fields/Loading";
import Results from "./fields/Results";

function Fields({ step, data, setData, result, loading, restart }) {

  switch (step) {
    case 0:
      return <Demographics data={data} setData={setData} />;

    case 1:
      return <Symptoms data={data} setData={setData} />;

    case 2:
      return <Questions data={data} setData={setData} />;

    case 3:
      return <Loading />;

    case 4:
      return <Results result={result} restart={restart} />;

    default:
      return null;
  }
}

export default Fields;