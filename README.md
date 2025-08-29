# Gyld Test

## How to Run
npm install
npm start -- --teams 3 --seed 42

## Approach

I approached this as a clustering problem. The goal is to study player data and group players into balanced teams before building a more formal classification model. Since there’s domain knowledge involved in defining what a “balanced team” means, I made a few assumptions after exploring the dataset.

I used AI assistance to support this solution.

## Modeling Choice (2–4 sentences)

I chose hierarchical clustering because it produces a deterministic, explainable structure that aligns with the need for interpretable team assignments. Unlike k-means, it does not rely on random initialization, which improves reproducibility. This makes it easier to understand and justify why certain players end up in the same cluster.

### Features Considered
historical_events_participated (numeric)
historical_event_engagements (numeric)
historical_points_earned (numeric)
historical_points_spent (numeric)
historical_messages_sent (numeric)
current_total_points (numeric)
days_active_last_30 (numeric)
current_streak_value (numeric)
last_active_ts (numeric)

Features Not Considered
------------------------
current_team_id (numeric)
current_team_name (categorical, perfectly correlated with team_id)
player_id (identifier, not predictive)

current_team_id and current_team_name are perfectly correlated, so we can drop one. Since the goal is to predict future team assignment, I excluded them from training. player_id is just an identifier and provides no predictive value.

### Key Assumptions

The central domain-specific assumption is what teams are meant to represent. I assume there is a hierarchy in skill/engagement levels. For three teams, I considered:

Beginner players – low values across most features.
Intermediate players – mid-range activity and engagement.
Advanced players – top performers with consistently high values.

A single feature like historical_points_earned could be used for clustering, but it would miss nuance. Some players may earn fewer points yet have strong engagement or consistency. To capture this, I explored a weighted sum of normalized features as a consolidated metric.

Preprocessing

Normalization: All features were normalized to account for different scales (e.g., points_earned ranges in the tens of thousands while events_participated maxes at 29).

Feature weighting: A weighted sum of normalized features was used to create a balanced representation of player “level.”

Tradeoffs (time limit)

Limited exploration of alternative clustering algorithms and feature engineering.

Clusters were not balanced at all — player behavior is skewed, with a small number of high performers dominating the top cluster. This could be addressed with a policy to spread top players evenly across teams.

If I Had More Time

Experiment with other clustering methods (e.g., Gaussian Mixtures, DBSCAN, spectral clustering) to see which hyperparameters align best with the problem.

Explore feature reduction via heuristics or dimensionality reduction (PCA, weighted sums) for more robust consolidated features.

Evaluate clustering stability with different random seeds and data splits.

Time Spent

A little more than 2 hours total sitting time.

AI Use

Yes, I used AI in the process.

See the prompts/ folder for 1–3 short prompts.

See FIXES.md for 3–5 concrete corrections made (file + function or short snippet references).

