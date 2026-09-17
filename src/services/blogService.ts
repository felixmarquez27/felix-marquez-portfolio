export interface BlogPostFrontmatter {
  title: string;
  description: string;
  pubDate?: string;
  date?: string;
  author: string;
  cover?: string;
  tags: string[];
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogPostFrontmatter & { pubDate: string };
  file: string;
}

export interface GetArticlesOptions {
  page?: number;
  limit?: number;
  query?: string;
  tag?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  currentPage: number;
  lastPage: number;
  hasMore: boolean;
}

/**
 * Servicio para manejar la lógica y consultas de los artículos del blog.
 */
export class BlogService {
  /**
   * Obtiene todos los artículos ordenados cronológicamente (más recientes primero).
   */
  static async getAllArticles(): Promise<BlogPost[]> {
    const markdownFiles = import.meta.glob<{
      frontmatter: BlogPostFrontmatter;
      file: string;
    }>("../articles/*.md", { eager: true });

    const articles = Object.values(markdownFiles).map((file) => {
      const slug = file.file.split("/").pop()?.replace(".md", "") || "";
      const pubDate =
        file.frontmatter.pubDate || file.frontmatter.date || "";

      return {
        slug,
        frontmatter: {
          ...file.frontmatter,
          pubDate,
        },
        file: file.file,
      };
    });

    return articles.sort(
      (a, b) =>
        new Date(b.frontmatter.pubDate).getTime() -
        new Date(a.frontmatter.pubDate).getTime(),
    );
  }

  /**
   * Obtiene la lista única de etiquetas/tags usadas en todos los artículos.
   */
  static async getTags(): Promise<string[]> {
    const articles = await this.getAllArticles();
    const tags = new Set<string>();

    articles.forEach((article) => {
      if (article.frontmatter.tags) {
        article.frontmatter.tags.forEach((tag) => tags.add(tag));
      }
    });

    return Array.from(tags).sort();
  }

  /**
   * Busca y filtra artículos por término de búsqueda y/o etiqueta.
   */
  static async searchArticles(
    query: string = "",
    tag: string = "all",
  ): Promise<BlogPost[]> {
    let articles = await this.getAllArticles();

    if (tag && tag !== "all") {
      articles = articles.filter(
        (a) => a.frontmatter.tags && a.frontmatter.tags.includes(tag),
      );
    }

    if (query) {
      const term = query.toLowerCase().trim();
      articles = articles.filter(
        (a) =>
          a.frontmatter.title.toLowerCase().includes(term) ||
          a.frontmatter.description.toLowerCase().includes(term),
      );
    }

    return articles;
  }

  /**
   * Obtiene artículos paginados con filtros opcionales.
   */
  static async getArticlesPaginated(
    options: GetArticlesOptions = {},
  ): Promise<PaginatedResult<BlogPost>> {
    const { page = 1, limit = 6, query = "", tag = "all" } = options;

    const filteredArticles = await this.searchArticles(query, tag);

    const total = filteredArticles.length;
    const lastPage = Math.ceil(total / limit) || 1;
    const currentPage = Math.max(1, Math.min(page, lastPage));

    const start = (currentPage - 1) * limit;
    const end = start + limit;
    const data = filteredArticles.slice(start, end);

    return {
      data,
      total,
      currentPage,
      lastPage,
      hasMore: currentPage < lastPage,
    };
  }
}
