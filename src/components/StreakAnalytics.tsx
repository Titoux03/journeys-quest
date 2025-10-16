import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, TrendingUp, Award, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StreakStats {
  activeUsers: number;
  avgStreak: number;
  totalBadges: number;
  longestStreak: number;
  streakDistribution: { range: string; count: number }[];
}

export const StreakAnalytics = () => {
  const [stats, setStats] = useState<StreakStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakAnalytics();
  }, []);

  const fetchStreakAnalytics = async () => {
    try {
      // Get all login streaks
      const { data: streaks, error: streaksError } = await supabase
        .from('login_streaks')
        .select('current_streak');

      if (streaksError) throw streaksError;

      // Get total badges awarded
      const { count: badgesCount, error: badgesError } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true });

      if (badgesError) throw badgesError;

      // Calculate statistics
      const streakValues = streaks?.map(s => s.current_streak) || [];
      const avgStreak = streakValues.length > 0
        ? streakValues.reduce((a, b) => a + b, 0) / streakValues.length
        : 0;
      const longestStreak = streakValues.length > 0 ? Math.max(...streakValues) : 0;

      // Calculate distribution
      const distribution = [
        { range: '1-3 days', count: streakValues.filter(s => s >= 1 && s <= 3).length },
        { range: '4-7 days', count: streakValues.filter(s => s >= 4 && s <= 7).length },
        { range: '8-14 days', count: streakValues.filter(s => s >= 8 && s <= 14).length },
        { range: '15-30 days', count: streakValues.filter(s => s >= 15 && s <= 30).length },
        { range: '31+ days', count: streakValues.filter(s => s >= 31).length },
      ];

      setStats({
        activeUsers: streaks?.length || 0,
        avgStreak: Math.round(avgStreak * 10) / 10,
        totalBadges: badgesCount || 0,
        longestStreak,
        streakDistribution: distribution,
      });
    } catch (error) {
      console.error('Error fetching streak analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">With active streaks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgStreak} days</div>
            <p className="text-xs text-muted-foreground">Average streak length</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBadges}</div>
            <p className="text-xs text-muted-foreground">Badges unlocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.longestStreak} days</div>
            <p className="text-xs text-muted-foreground">Platform record</p>
          </CardContent>
        </Card>
      </div>

      {/* Streak Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Streak Distribution</CardTitle>
          <CardDescription>User count by streak length</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.streakDistribution.map((item) => (
              <div key={item.range} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">{item.range}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-64 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{
                        width: `${stats.activeUsers > 0 ? (item.count / stats.activeUsers) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
