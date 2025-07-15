CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"icon_type" text NOT NULL,
	"icon_color" text DEFAULT 'gold' NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"requirement" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"rarity" text DEFAULT 'common' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" text NOT NULL,
	"target_table" text,
	"target_id" uuid,
	"notes" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"ticker" text NOT NULL,
	"signal_type" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"timestamp" timestamp NOT NULL,
	"timeframe" text,
	"source" text DEFAULT 'webhook' NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "available_tickers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"symbol" text NOT NULL,
	"description" text NOT NULL,
	"category" text DEFAULT 'other' NOT NULL,
	"market_cap" integer DEFAULT 999,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "available_tickers_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "cycle_forecast_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticker" text NOT NULL,
	"model_name" text NOT NULL,
	"model_type" text NOT NULL,
	"confidence" numeric(5, 4) NOT NULL,
	"accuracy" numeric(5, 4),
	"is_active" boolean DEFAULT true NOT NULL,
	"parameters" jsonb,
	"calibration_data" jsonb,
	"performance_metrics" jsonb,
	"last_calibration" timestamp,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cycle_indicator_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticker" text NOT NULL,
	"date" timestamp NOT NULL,
	"ma_2y" numeric(10, 2) NOT NULL,
	"deviation" numeric(5, 2) NOT NULL,
	"harmonic_cycle" numeric(8, 4),
	"fibonacci_level" numeric(8, 4),
	"cycle_momentum" numeric(8, 4),
	"seasonal_weight" numeric(8, 4),
	"volatility_index" numeric(8, 4),
	"fractal_dimension" numeric(8, 6),
	"entropy_score" numeric(8, 4),
	"elliott_wave_count" integer,
	"gann_angle" numeric(8, 4),
	"cycle_phase" text,
	"strength_score" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_layouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" varchar(100) NOT NULL,
	"widgets" jsonb NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forecast_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticker" text NOT NULL,
	"date" timestamp NOT NULL,
	"predicted_price" numeric(10, 2) NOT NULL,
	"confidence_low" numeric(10, 2) NOT NULL,
	"confidence_high" numeric(10, 2) NOT NULL,
	"model_type" text,
	"algorithm_weights" jsonb,
	"market_regime" text,
	"cycle_phase" text,
	"support_levels" jsonb,
	"resistance_levels" jsonb,
	"volatility_forecast" numeric(8, 4),
	"trend_strength" numeric(5, 4),
	"harmonic_target" numeric(10, 2),
	"fibonacci_target" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "heatmap_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticker" text NOT NULL,
	"week" timestamp NOT NULL,
	"sma_200w" numeric(10, 2) NOT NULL,
	"deviation_percent" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_healthy" boolean DEFAULT true NOT NULL,
	"last_health_check" timestamp,
	"config" jsonb NOT NULL,
	"rate_limit_per_minute" integer DEFAULT 60,
	"rate_limit_per_hour" integer DEFAULT 1000,
	"provider" text NOT NULL,
	"provider_config" jsonb NOT NULL,
	"total_sent" integer DEFAULT 0 NOT NULL,
	"total_delivered" integer DEFAULT 0 NOT NULL,
	"total_failed" integer DEFAULT 0 NOT NULL,
	"avg_delivery_time_ms" integer DEFAULT 0,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_channels_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "notification_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"queue_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"channel" text NOT NULL,
	"recipient" text NOT NULL,
	"status" text NOT NULL,
	"provider" text,
	"provider_message_id" text,
	"provider_response" jsonb,
	"processing_time_ms" integer,
	"delivery_time_ms" integer,
	"error_code" text,
	"error_message" text,
	"error_details" jsonb,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"alert_id" uuid,
	"channel" text NOT NULL,
	"recipient" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"message_html" text,
	"template_id" uuid,
	"template_variables" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" integer DEFAULT 5 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"current_attempts" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp,
	"next_retry_at" timestamp,
	"scheduled_for" timestamp DEFAULT now(),
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"last_error" text,
	"error_details" jsonb,
	"metadata" jsonb,
	"provider_message_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"subject" text,
	"body_text" text NOT NULL,
	"body_html" text,
	"variables" jsonb DEFAULT '[]' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"description" text,
	"tags" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "notification_timing_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"notification_id" varchar NOT NULL,
	"sent_at" timestamp NOT NULL,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"dismissed_at" timestamp,
	"response_time" integer,
	"market_condition" varchar,
	"signal_confidence" numeric(5, 4),
	"user_active_score" numeric(3, 2),
	"time_score" numeric(3, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_timing_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"timezone" varchar NOT NULL,
	"preferred_hours" jsonb NOT NULL,
	"quiet_hours" jsonb NOT NULL,
	"weekend_preference" varchar DEFAULT 'reduced' NOT NULL,
	"market_open_only" boolean DEFAULT false,
	"max_notifications_per_hour" integer DEFAULT 3,
	"adaptive_timing" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ohlc_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticker_symbol" text NOT NULL,
	"interval" text NOT NULL,
	"time" timestamp NOT NULL,
	"open" numeric(10, 2) NOT NULL,
	"high" numeric(10, 2) NOT NULL,
	"low" numeric(10, 2) NOT NULL,
	"close" numeric(10, 2) NOT NULL,
	"volume" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "smart_timing_optimizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"optimization_type" varchar NOT NULL,
	"current_setting" jsonb NOT NULL,
	"suggested_setting" jsonb NOT NULL,
	"confidence_score" numeric(3, 2) NOT NULL,
	"applied_at" timestamp,
	"effectiveness_score" numeric(3, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"tier" text NOT NULL,
	"stripe_price_id" text NOT NULL,
	"monthly_price" integer NOT NULL,
	"yearly_price" integer,
	"features" text[],
	"max_signals" integer,
	"max_tickers" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_plans_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
CREATE TABLE "trading_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"risk_level" text DEFAULT 'moderate',
	"max_trade_amount" numeric(20, 2) DEFAULT '1000',
	"auto_trading" boolean DEFAULT false,
	"stop_loss" numeric(5, 2) DEFAULT '5',
	"take_profit" numeric(5, 2) DEFAULT '10',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"target" integer NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"ticker" text NOT NULL,
	"condition" text NOT NULL,
	"value" numeric(20, 8) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"channels" text[] DEFAULT '{"email"}' NOT NULL,
	"last_triggered" timestamp,
	"trigger_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_portfolio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ticker" text NOT NULL,
	"quantity" numeric(20, 8) NOT NULL,
	"average_price" numeric(20, 8) NOT NULL,
	"current_value" numeric(20, 8) NOT NULL,
	"pnl" numeric(20, 8) DEFAULT '0',
	"pnl_percentage" numeric(10, 4) DEFAULT '0',
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_name" text NOT NULL,
	"permissions" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"notification_email" boolean DEFAULT true NOT NULL,
	"notification_sms" boolean DEFAULT false NOT NULL,
	"notification_push" boolean DEFAULT true NOT NULL,
	"notification_telegram" boolean DEFAULT false NOT NULL,
	"email_signal_alerts" boolean DEFAULT true NOT NULL,
	"sms_signal_alerts" boolean DEFAULT false NOT NULL,
	"push_signal_alerts" boolean DEFAULT true NOT NULL,
	"email_frequency" text DEFAULT 'realtime' NOT NULL,
	"quiet_hours_start" text DEFAULT '22:00',
	"quiet_hours_end" text DEFAULT '08:00',
	"weekend_notifications" boolean DEFAULT true NOT NULL,
	"email_address" text,
	"phone_number" text,
	"telegram_chat_id" text,
	"webhook_secret" text,
	"webhook_enabled" boolean DEFAULT false NOT NULL,
	"push_subscription" jsonb,
	"push_enabled" boolean DEFAULT false NOT NULL,
	"price_alerts" boolean DEFAULT true NOT NULL,
	"volume_alerts" boolean DEFAULT false NOT NULL,
	"news_alerts" boolean DEFAULT true NOT NULL,
	"technical_alerts" boolean DEFAULT true NOT NULL,
	"whale_alerts" boolean DEFAULT false NOT NULL,
	"theme" text DEFAULT 'dark' NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"date_format" text DEFAULT 'MM/DD/YYYY' NOT NULL,
	"time_format" text DEFAULT '12h' NOT NULL,
	"default_chart_type" text DEFAULT 'candlestick' NOT NULL,
	"default_timeframe" text DEFAULT '15m' NOT NULL,
	"chart_theme" text DEFAULT 'dark' NOT NULL,
	"show_volume" boolean DEFAULT true NOT NULL,
	"show_indicators" boolean DEFAULT true NOT NULL,
	"auto_refresh_charts" boolean DEFAULT true NOT NULL,
	"chart_refresh_interval" integer DEFAULT 30 NOT NULL,
	"default_order_type" text DEFAULT 'market' NOT NULL,
	"confirm_trades" boolean DEFAULT true NOT NULL,
	"enable_paper_trading" boolean DEFAULT true NOT NULL,
	"paper_trading_balance" numeric(15, 2) DEFAULT '10000.00',
	"risk_percentage" numeric(5, 2) DEFAULT '2.00',
	"stop_loss_percentage" numeric(5, 2) DEFAULT '3.00',
	"take_profit_percentage" numeric(5, 2) DEFAULT '6.00',
	"default_dashboard" text DEFAULT 'overview' NOT NULL,
	"show_price_alerts" boolean DEFAULT true NOT NULL,
	"show_recent_trades" boolean DEFAULT true NOT NULL,
	"show_portfolio_summary" boolean DEFAULT true NOT NULL,
	"show_market_overview" boolean DEFAULT true NOT NULL,
	"max_dashboard_items" integer DEFAULT 20 NOT NULL,
	"compact_view" boolean DEFAULT false NOT NULL,
	"profile_visibility" text DEFAULT 'private' NOT NULL,
	"share_trade_history" boolean DEFAULT false NOT NULL,
	"allow_analytics" boolean DEFAULT true NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"session_timeout" integer DEFAULT 1440 NOT NULL,
	"enable_beta_features" boolean DEFAULT false NOT NULL,
	"api_access_enabled" boolean DEFAULT false NOT NULL,
	"webhook_url" text,
	"custom_css_enabled" boolean DEFAULT false NOT NULL,
	"custom_css" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"total_logins" integer DEFAULT 0 NOT NULL,
	"login_streak" integer DEFAULT 0 NOT NULL,
	"last_login_date" timestamp,
	"signals_received" integer DEFAULT 0 NOT NULL,
	"alerts_created" integer DEFAULT 0 NOT NULL,
	"dashboard_views" integer DEFAULT 0 NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_stats_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ticker_symbol" text NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ticker" text NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"price" numeric(20, 8) NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"status" text DEFAULT 'EXECUTED',
	"mode" text DEFAULT 'paper',
	"signal_id" uuid,
	"pnl" numeric(20, 8),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"hashed_password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"first_name" text,
	"last_name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"subscription_tier" text DEFAULT 'free' NOT NULL,
	"subscription_status" text,
	"subscription_ends_at" timestamp,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "webhook_secrets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"secret" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"allowed_sources" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_used" timestamp,
	"usage_count" integer DEFAULT 0,
	CONSTRAINT "webhook_secrets_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "admin_activity_log" ADD CONSTRAINT "admin_activity_log_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_signals" ADD CONSTRAINT "alert_signals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_layouts" ADD CONSTRAINT "dashboard_layouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_queue_id_notification_queue_id_fk" FOREIGN KEY ("queue_id") REFERENCES "public"."notification_queue"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_queue" ADD CONSTRAINT "notification_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_queue" ADD CONSTRAINT "notification_queue_alert_id_alert_signals_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alert_signals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_timing_analytics" ADD CONSTRAINT "notification_timing_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_timing_preferences" ADD CONSTRAINT "notification_timing_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_timing_optimizations" ADD CONSTRAINT "smart_timing_optimizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_settings" ADD CONSTRAINT "trading_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_alerts" ADD CONSTRAINT "user_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_portfolio" ADD CONSTRAINT "user_portfolio_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_ticker_symbol_available_tickers_symbol_fk" FOREIGN KEY ("ticker_symbol") REFERENCES "public"."available_tickers"("symbol") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_trades" ADD CONSTRAINT "user_trades_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_trades" ADD CONSTRAINT "user_trades_signal_id_alert_signals_id_fk" FOREIGN KEY ("signal_id") REFERENCES "public"."alert_signals"("id") ON DELETE no action ON UPDATE no action;