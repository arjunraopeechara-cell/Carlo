// Chat bubbles. "say" messages are the lines Carlo suggests saying to the dealer.
export default function ChatLog({ msgs, ...rest }) {
  return (
    <div className="log" {...rest}>
      {msgs.map(([who, text], i) => who === "say"
        ? <p key={i} className="msg say"><small>Say this</small>{text}</p>
        : <p key={i} className={"msg " + who}>{text}</p>)}
    </div>
  );
}
