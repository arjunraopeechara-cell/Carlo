import Link from "next/link";

// Chat bubbles. "link" messages are buttons to another page. "say" messages are the lines Carlo suggests saying to the dealer.
export default function ChatLog({ msgs, ...rest }) {
  return (
    <div className="log" {...rest}>
      {msgs.map(([who, text, href], i) => who === "link" ? <Link key={i} className="msg link" href={href}>{text}</Link> : who === "say"
        ? <p key={i} className="msg say"><small>Say this</small>{text}</p>
        : <p key={i} className={"msg " + who}>{text}</p>)}
    </div>
  );
}
