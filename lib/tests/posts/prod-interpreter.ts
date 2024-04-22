import { TaskIO, baseInterpreter, handler, interpreter, match } from "../../monads";
import { Email, Post, User } from "./interfaces";

const uri = "https://jsonplaceholder.typicode.com";

const findAllPosts = handler<Post[]>((program) => {
  return TaskIO.from(() => fetch(`${uri}/posts`).then<Post[]>((res) => res.json())).map((posts) =>
    program.run(posts)
  );
});

const findUserByPost = handler<User, Post>((program) => {
  return program.payload
    .map((post) =>
      TaskIO.from(() => fetch(`${uri}/users/${post.userId}`).then<User>((res) => res.json()))
    )
    .getOrElse(TaskIO.rejected("Post not found"))
    .map((data) => program.run(data));
});

const sendEmail = handler<void, Email>((program) => {
  return program.payload
    .map((email) => {
      console.log(`Sending email to ${email.email}`);
      console.log(`Subject: Hello ${email.name} \n`);
    })
    .tap(() => program.run(undefined));
});

export const prodInterpreter = baseInterpreter().chain(
  interpreter(
    match("find-all-posts").from(findAllPosts),
    match("find-user-by-post").from(findUserByPost),
    match("send-email").from(sendEmail)
  )
);
