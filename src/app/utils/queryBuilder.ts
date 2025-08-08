import { Query } from "mongoose";

const excludeField = ["searchTerm", "sort", "fields", "page", "limit"];

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  filter(): this {
    const filter = { ...this.query };

    for (const field of excludeField) {
      delete filter[field];
    }

    const mongoFilter: Record<string, any> = {};

    // for (const key in filter) {
    //   const value = filter[key];

    //   // Handle multiple values (e.g., role=ADMIN&role=SUPER_ADMIN)
    //   if (Array.isArray(value)) {
    //     mongoFilter[key] = { $in: value };
    //   } else if (typeof value === "string" && value.includes(",")) {
    //     // Handle comma-separated strings: role=ADMIN,SUPER_ADMIN
    //     mongoFilter[key] = { $in: value.split(",") };
    //   } else {
    //     mongoFilter[key] = value;
    //   }
    // }

    for (const key in filter) {
      const value = filter[key];

      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !Buffer.isBuffer(value)
      ) {
        mongoFilter[key] = value;
      } else if (Array.isArray(value)) {
        mongoFilter[key] = { $in: value };
      } else if (typeof value === "string" && value.includes(",")) {
        mongoFilter[key] = { $in: value.split(",") };
      } else {
        mongoFilter[key] = value;
      }
    }
    this.modelQuery = this.modelQuery.find(mongoFilter);

    return this;
  }

  search(searchableField: string[]): this {
    const searchTerm = this.query.searchTerm || "";
    const searchQuery = {
      $or: searchableField.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      })),
    };
    this.modelQuery = this.modelQuery.find(searchQuery); // Tour.find().find(filter).find(searchQuery)
    return this;
  }

  sort(): this {
    const sort = this.query.sort || "-createdAt";

    this.modelQuery = this.modelQuery.sort(sort); // Tour.find().find(filter).find(searchQuery).sort()

    return this;
  }
  fields(): this {
    const fields = this.query.fields?.split(",").join(" ") || "";

    this.modelQuery = this.modelQuery.select(fields); // Tour.find().find(filter).find(searchQuery).sort().select()

    return this;
  }
  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 20;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit); // Tour.find().find(filter).find(searchQuery).sort().select().skip().limit()

    return this;
  }

  build() {
    return this.modelQuery;
  }

  async getMeta() {
    const totalDocuments = await this.modelQuery.model.countDocuments();

    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 20;

    const totalPage = Math.ceil(totalDocuments / limit);

    return { page, limit, total: totalDocuments, totalPage };
  }
}
