# Gyld Player Clustering

A TypeScript application for clustering players based on their activity and engagement metrics using hierarchical clustering.

## Quick Start

```bash
# Install dependencies
npm install

# Run with default 3 teams
npm start

# Run with custom number of teams
npm start -- --teams 5
```

## Approach

This project approaches team assignment as a clustering problem. The goal is to study player data and group players into balanced teams before building a more formal classification model. Since there's domain knowledge involved in defining what a "balanced team" means, several assumptions were made after exploring the dataset.

### Modeling Choice

I chose hierarchical clustering because it produces a deterministic, explainable structure that aligns with the need for interpretable team assignments. Unlike k-means, it does not rely on random initialization, which improves reproducibility. This makes it easier to understand and justify why certain players end up in the same cluster.

### Features Considered

**Included Features:**
- `historical_events_participated` (numeric)
- `historical_event_engagements` (numeric)
- `historical_points_earned` (numeric)
- `historical_points_spent` (numeric)
- `historical_messages_sent` (numeric)
- `current_total_points` (numeric)
- `days_active_last_30` (numeric)
- `current_streak_value` (numeric)

**Excluded Features:**
- `current_team_id` (numeric) - Perfectly correlated with team_name
- `current_team_name` (categorical) - Perfectly correlated with team_id
- `player_id` (identifier) - Not predictive, just an identifier
- `last_active_ts` (numeric) - Excluded for now

Since the goal is to predict future team assignment, current team information was excluded from training. Player ID is just an identifier and provides no predictive value.

### Key Assumptions

The central domain-specific assumption is what teams are meant to represent. I assume there is a hierarchy in skill/engagement levels. For three teams, I considered:

- **Beginner players** – low values across most features
- **Intermediate players** – mid-range activity and engagement
- **Advanced players** – top performers with consistently high values

A single feature like `historical_points_earned` could be used for clustering, but it would miss nuance. Some players may earn fewer points yet have strong engagement or consistency. To capture this, the application uses a multi-dimensional approach with proper feature scaling.

### Preprocessing

**Normalization**: All features are normalized to account for different scales (e.g., points_earned ranges in the tens of thousands while events_participated maxes at 29).

**Feature Scaling**: The application uses a two-step scaling process:
1. **Min-Max Normalization**: Scales values to [0,1] range
2. **Z-Score Standardization**: Centers data around mean with unit variance

This ensures all features contribute equally to the clustering regardless of their original scales.

## Data Requirements

Place your Excel file at `data/level_a_players.xlsx` with these columns:

| Column | Description | Type |
|--------|-------------|------|
| `player_id` | Unique player identifier | Number |
| `historical_events_participated` | Events participated in | Number |
| `historical_event_engagements` | Event interactions | Number |
| `historical_points_earned` | Total points earned | Number |
| `historical_points_spent` | Total points spent | Number |
| `historical_messages_sent` | Messages sent | Number |
| `current_total_points` | Current point balance | Number |
| `days_active_last_30` | Recent activity | Number |
| `current_streak_value` | Current streak | Number |

## Architecture

### Core Files

- **`src/index.ts`**: Main application with clustering logic
- **`src/stats-helpers.ts`**: Statistical analysis and data scaling
- **`src/exploration.ts`**: Excel file utilities (for data exploration)

### Data Processing Pipeline

1. **Data Loading**: Read Excel file and extract player features
2. **Feature Scaling**: Normalize and standardize all features
3. **Clustering**: Apply hierarchical clustering with Euclidean distance
4. **Results**: Output team assignments for each player

## Output

The application outputs:
- Feature statistics for each dimension
- Sample of scaled data
- Team assignments with player IDs
- Cluster sizes and member lists

## Tradeoffs & Limitations

**Current Limitations:**
- Limited exploration of alternative clustering algorithms and feature engineering
- Clusters may not be perfectly balanced — player behavior is skewed, with a small number of high performers potentially dominating the top cluster
- This could be addressed with a policy to spread top players evenly across teams

**Future Improvements:**
- Experiment with other clustering methods (e.g., Gaussian Mixtures, DBSCAN, spectral clustering)
- Explore feature reduction via heuristics or dimensionality reduction (PCA, weighted sums)
- Evaluate clustering stability with different random seeds and data splits

## Dependencies

- `hierarchical-clustering`: Clustering algorithm
- `xlsx`: Excel file processing
- `tsx`: TypeScript execution
- `@types/node`: TypeScript definitions

## Final Note

This solution is not final, but it is on the right track. With more time for literature review and testing, the limitations (like skewed cluster balance) can be addressed. The core idea—treating team assignment as a clustering problem with interpretable methods—is sound, although at the end I think another cluster algorithm would be more suited, like K-means or a combination of both.

