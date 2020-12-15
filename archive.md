---
layout: default
title: Archive
---

# Blog

Browse all posts by recent.

{% assign postsByYearMonth = site.posts | group_by_exp: "post", "post.date | date: '%B %Y'" %}
{% for yearMonth in postsByYearMonth %}

  <ul>
    {% for post in yearMonth.items %}
      <li>
        <a href="{{ post.url }}">
					{{ post.title }}
					<small><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date_to_string }}</time></small>
				</a>
    	</li>
    {% endfor %}
  </ul>

{% endfor %}

