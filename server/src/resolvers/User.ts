import { Users } from "../entities/User";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";

import { UserInput } from "./UserInput";
import { validateRegister } from "../utils/vaildateRegister";
import { sign } from "jsonwebtoken";
import { MyContext } from "src/types";
import { __prod__ } from "../constants";

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Users, { nullable: true })
  user?: Users;

  @Field({ nullable: true })
  accessToken?: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "hi";
  }

  @Mutation(() => UserResponse)
  async register(@Arg("options") options: UserInput): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);

    const user = Users.create({
      email: options.email,
      password: hashedPassword,
    });
    try {
      await user.save();
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "email",
              message: "This email already is associated with an account",
            },
          ],
        };
      }
      console.log("message:", err);
    }

    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UserInput,
    @Ctx() { res }: MyContext
  ): Promise<UserResponse> {
    const user = await Users.findOne({ where: { email: options.email } });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "username does not exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Password is wrong",
          },
        ],
      };
    }

    //Login success
    //Access token should be set to something shorter
    //refresh token is longer and when it expires it auto logs them out (7days)

    res.cookie(
      "jid",
      sign({ userId: user.id }, process.env.COOKIE_SECRET as string, {
        expiresIn: "7d",
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__, //cookie only works in https
      }
    );

    return {
      // user,
      accessToken: sign(
        { userId: user.id },
        process.env.JSONWEBTOKENSECRET as string,
        { expiresIn: "15m" }
      ),
    };
  }
}

//Equivalent of this:
// typeDefs: `
// type Query {
//   hello: String!
// }
// `,
// resolvers: {
//   Query: {
//     hello: () => "hello world",
//   },
// },
