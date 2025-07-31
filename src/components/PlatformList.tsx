"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface BlogPost {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  slug: string;
}

export default function PlatformList({
  latestBlogs,
  locale,
}: {
  latestBlogs: BlogPost[];
  locale: string;
}) {
  const t = useTranslations("home");
  const router = useRouter();

  const getLocalizedPath = (path: string) => {
    if (locale === "en") {
      return path;
    }
    return `/${locale}${path}`;
  };

  return (
    <section className="py-16 bg-gray-100/50  antialiased">
      <div className="container">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold gradient-text-blue mb-4">
            {t("topPlatformsTitle")}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-500 mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Discover the most popular video chat platforms and start connecting
            with people worldwide
          </p>
        </div>

        <div className="space-y-4">
          {latestBlogs.length > 0 ? (
            latestBlogs.map((blog, index) => {
              // Use current locale for title and description

              return (
                <Link key={blog._id} href={getLocalizedPath(`/apps/${blog.slug}.html`)}>
                  <div
                    className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center px-6 py-2">
                      <div className="mr-6">
                        {blog.imageUrl ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg">
                            <Image
                              src={blog.imageUrl}
                              alt={blog.title}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <svg
                              className="w-8 h-8 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors duration-300">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {blog.description}
                        </p>
                      </div>

                      {/* Action button - hidden on mobile */}
                      <div className="ml-6 hidden md:block">
                        <button className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-1 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 whitespace-nowrap">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                          {t("readMore")}
                        </button>
                      </div>
                    </div>

                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-bl-full"></div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Platforms Available
              </h3>
              <p className="text-gray-500">
                Check back soon for the latest video chat platforms
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
